import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Collection } from "@/contexts/CollectionContext";
import { Upload, X } from "lucide-react";

interface CollectionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (collection: Omit<Collection, "id" | "slug">) => void;
    initialData?: Collection | null;
}

const CollectionForm = ({ open, onOpenChange, onSubmit, initialData }: CollectionFormProps) => {
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        description: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                image: initialData.image,
                description: initialData.description || "",
            });
        } else {
            setFormData({
                name: "",
                image: "",
                description: "",
            });
        }
    }, [initialData, open]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    image: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Coleção" : "Nova Coleção"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Coleção</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Imagem de Capa</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center relative group">
                            {formData.image ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: "" })}
                                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Clique para selecionar uma imagem
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="collection-image-upload"
                                        required={!initialData}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById("collection-image-upload")?.click()}
                                    >
                                        Selecionar Arquivo
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="bg-white text-black hover:bg-gray-100 font-bold">
                            Salvar Coleção
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CollectionForm;
