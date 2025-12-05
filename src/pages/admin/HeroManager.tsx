import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, MoveUp, MoveDown, Image as ImageIcon } from "lucide-react";

type HeroSlide = {
    id: string;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    button_text: string | null;
    button_link: string | null;
    background_type: string | null;
    background_color: string | null;
    order_index: number;
    active: boolean;
};

const HeroManager = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<HeroSlide>>({
        title: "",
        subtitle: "",
        image_url: "",
        button_text: "",
        button_link: "",
        background_type: "Imagem + Texto",
        background_color: "#000000",
        active: true,
    });

    const { data: slides, isLoading } = useQuery({
        queryKey: ["hero-slides"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("hero_slides")
                .select("*")
                .order("order_index", { ascending: true });

            if (error) throw error;
            return data as HeroSlide[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newSlide: Partial<HeroSlide>) => {
            const { data, error } = await supabase
                .from("hero_slides")
                .insert([{ ...newSlide, order_index: slides ? slides.length : 0 }])
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
            setIsDialogOpen(false);
            resetForm();
            toast.success("Slide criado com sucesso!");
        },
        onError: (error) => {
            toast.error(`Erro ao criar slide: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (slide: Partial<HeroSlide>) => {
            if (!slide.id) throw new Error("ID is required for update");
            const { data, error } = await supabase
                .from("hero_slides")
                .update(slide)
                .eq("id", slide.id)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
            setIsDialogOpen(false);
            resetForm();
            toast.success("Slide atualizado com sucesso!");
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar slide: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("hero_slides").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
            toast.success("Slide removido com sucesso!");
        },
        onError: (error) => {
            toast.error(`Erro ao remover slide: ${error.message}`);
        },
    });

    const reorderMutation = useMutation({
        mutationFn: async (items: { id: string; order_index: number }[]) => {
            for (const item of items) {
                const { error } = await supabase
                    .from("hero_slides")
                    .update({ order_index: item.order_index })
                    .eq("id", item.id);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
        },
    });

    const validateImageAspectRatio = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                // 16:9 is approximately 1.77. Allow a small margin of error (1.7 to 1.85)
                const isValid = ratio >= 1.7 && ratio <= 1.85;
                resolve(isValid);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Selecione uma imagem para fazer upload.");
            }

            const file = event.target.files[0];

            // Validate aspect ratio
            const isValidRatio = await validateImageAspectRatio(file);
            if (!isValidRatio) {
                throw new Error("A imagem deve ter proporção 16:9.");
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("hero")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("hero").getPublicUrl(filePath);
            setFormData({ ...formData, image_url: data.publicUrl });
            toast.success("Imagem carregada com sucesso!");
        } catch (error: any) {
            toast.error(`Erro no upload: ${error.message}`);
            // Clear the input
            event.target.value = "";
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSlide) {
            updateMutation.mutate({ ...formData, id: editingSlide.id });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData(slide);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja excluir este slide?")) {
            deleteMutation.mutate(id);
        }
    };

    const moveSlide = (index: number, direction: "up" | "down") => {
        if (!slides) return;
        const newSlides = [...slides];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSlides.length) return;

        const temp = newSlides[index];
        newSlides[index] = newSlides[targetIndex];
        newSlides[targetIndex] = temp;

        // Update order_index for all affected slides
        const updates = newSlides.map((slide, idx) => ({
            id: slide.id,
            order_index: idx,
        }));

        reorderMutation.mutate(updates);
    };

    const resetForm = () => {
        setEditingSlide(null);
        setFormData({
            title: "",
            subtitle: "",
            image_url: "",
            button_text: "",
            button_link: "",
            background_type: "Imagem + Texto",
            background_color: "#000000",
            active: true,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Hero Section</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-white text-black hover:bg-white/90">
                            <Plus className="mr-2 h-4 w-4" /> Novo Slide
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingSlide ? "Editar Slide" : "Novo Slide"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formData.background_type !== "Somente Imagem" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título Principal *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title || ""}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            maxLength={60}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subtitle">Subtítulo</Label>
                                        <Input
                                            id="subtitle"
                                            value={formData.subtitle || ""}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            maxLength={120}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="background_type">Tipo de Fundo</Label>
                                <Select
                                    value={formData.background_type || "Imagem + Texto"}
                                    onValueChange={(value) => setFormData({ ...formData, background_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Imagem + Texto">Imagem + Texto</SelectItem>
                                        <SelectItem value="Somente Texto">Somente Texto</SelectItem>
                                        <SelectItem value="Somente Imagem">Somente Imagem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(formData.background_type === "Imagem + Texto" || formData.background_type === "Somente Imagem") && (
                                <div className="space-y-2">
                                    <Label>Imagem de Fundo (16:9) {formData.background_type === "Somente Imagem" && "*"}</Label>
                                    <div className="flex items-center gap-4">
                                        {formData.image_url && (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-24 h-16 object-cover rounded border"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                                required={formData.background_type === "Somente Imagem" && !formData.image_url}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Apenas imagens na proporção 16:9 são permitidas.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.background_type === "Somente Texto" && (
                                <div className="space-y-2">
                                    <Label>Fundo</Label>
                                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                        <img
                                            src="/hero-bg.png"
                                            alt="Default Background"
                                            className="w-24 h-16 object-cover rounded border opacity-60 blur-[1px]"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Será utilizada a imagem de fundo padrão do site.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {formData.background_type !== "Somente Imagem" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="button_text">Texto do Botão</Label>
                                        <Input
                                            id="button_text"
                                            value={formData.button_text || ""}
                                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="button_link">Link do Botão</Label>
                                        <Input
                                            id="button_link"
                                            value={formData.button_link || ""}
                                            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                                />
                                <Label htmlFor="active">Slide Ativo</Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={uploading || createMutation.isPending || updateMutation.isPending} className="bg-white text-black hover:bg-white/90">
                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {slides?.map((slide, index) => (
                        <Card key={slide.id} className={!slide.active ? "opacity-60" : ""}>
                            <CardContent className="flex items-center p-4 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === 0}
                                        onClick={() => moveSlide(index, "up")}
                                    >
                                        <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === (slides.length - 1)}
                                        onClick={() => moveSlide(index, "down")}
                                    >
                                        <MoveDown className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="w-32 h-20 bg-muted rounded overflow-hidden flex items-center justify-center border">
                                    {(slide.background_type === "Imagem + Texto" || slide.background_type === "Somente Imagem") && slide.image_url ? (
                                        <img src={slide.image_url} alt={slide.title || "Slide"} className="w-full h-full object-cover" />
                                    ) : slide.background_type === "Somente Texto" ? (
                                        <img src="/hero-bg.png" alt="Default" className="w-full h-full object-cover opacity-60 blur-[1px]" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{slide.title || "Imagem sem Texto"}</h3>
                                        {!slide.active && (
                                            <span className="text-xs bg-muted px-2 py-1 rounded">Inativo</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(slide)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(slide.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {slides?.length === 0 && (
                        <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                            Nenhum slide encontrado. Crie o primeiro!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HeroManager;
