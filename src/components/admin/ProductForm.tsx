import { useState, useEffect } from "react";
import heic2any from "heic2any";
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
import { Product } from "@/contexts/ProductContext";
import { useCollections } from "@/contexts/CollectionContext";
import { useCategories } from "@/contexts/CategoryContext";
import { X, Plus, Upload } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (product: Omit<Product, "id">) => Promise<void>;
    initialData?: Product | null;
}

const ProductForm = ({ open, onOpenChange, onSubmit, initialData }: ProductFormProps) => {
    const { collections } = useCollections();
    const { categories } = useCategories();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        images: [] as string[],
        sizes: [] as { size: string; stock: number }[],
        description: "",
        collectionId: undefined as number | undefined,
    });

    const [newSize, setNewSize] = useState("");
    const [newStock, setNewStock] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                price: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(initialData.price),
                category: initialData.category,
                images: initialData.images || [],
                sizes: initialData.sizes || [],
                description: initialData.description || "",
                collectionId: initialData.collectionId,
                categoryId: initialData.categoryId,
            });
        } else {
            setFormData({
                name: "",
                price: "",
                category: "",
                images: [],
                sizes: [],
                description: "",
                collectionId: undefined,
                categoryId: undefined,
            });
        }
    }, [initialData, open]);

    const formatCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        const floatValue = parseFloat(numericValue) / 100;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(isNaN(floatValue) ? 0 : floatValue);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        setFormData({ ...formData, price: formatted });
    };



    // ... (existing imports)

    // ... inside component

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setIsLoading(true); // Show loading state during conversion
            const fileArray = Array.from(files);
            const newImages: string[] = [];

            try {
                for (const file of fileArray) {
                    let fileToProcess = file;

                    // Check for HEIC
                    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
                        try {
                            console.log("Converting HEIC file:", file.name);
                            const convertedBlob = await heic2any({
                                blob: file,
                                toType: "image/jpeg",
                                quality: 0.8
                            });

                            // heic2any can return a Blob or Blob[], handle both
                            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                            fileToProcess = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
                        } catch (error) {
                            console.error("Error converting HEIC:", error);
                            // Continue with original file if conversion fails
                        }
                    }

                    // Read as Data URL
                    await new Promise<void>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            if (reader.result) {
                                newImages.push(reader.result as string);
                            }
                            resolve();
                        };
                        reader.readAsDataURL(fileToProcess);
                    });
                }

                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...newImages],
                }));
            } catch (error) {
                console.error("Error processing images:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const addSize = () => {
        if (newSize && newStock) {
            setFormData((prev) => ({
                ...prev,
                sizes: [...prev.sizes, { size: newSize.toUpperCase(), stock: parseInt(newStock) }],
            }));
            setNewSize("");
            setNewStock("");
        }
    };

    const removeSize = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            sizes: prev.sizes.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const priceValue = parseFloat(formData.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

        try {
            await onSubmit({
                ...formData,
                price: isNaN(priceValue) ? 0 : priceValue,
                slug: "", // Will be generated by context
                brand: "Conexão 011", // Default brand
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting product:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço</Label>
                            <Input
                                id="price"
                                value={formData.price}
                                onChange={handlePriceChange}
                                placeholder="R$ 0,00"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                            value={formData.categoryId?.toString()}
                            onValueChange={(value) => {
                                const categoryId = parseInt(value);
                                const categoryName = categories.find(c => c.id === categoryId)?.name || "";
                                setFormData({
                                    ...formData,
                                    categoryId: categoryId,
                                    category: categoryName
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="collection">Coleção</Label>
                        <Select
                            value={formData.collectionId?.toString()}
                            onValueChange={(value) => setFormData({ ...formData, collectionId: parseInt(value) })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma coleção" />
                            </SelectTrigger>
                            <SelectContent>
                                {collections.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id.toString()}>
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <div className="h-60 mb-12">
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                className="h-48"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tamanhos e Estoque</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                placeholder="Tam. (ex: M)"
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                className="w-24"
                            />
                            <Input
                                type="number"
                                placeholder="Qtd"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="w-24"
                            />
                            <Button type="button" onClick={addSize} size="icon" variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.sizes.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-md">
                                    <span className="font-bold">{item.size}</span>
                                    <span className="text-muted-foreground text-sm">({item.stock})</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSize(index)}
                                        className="text-destructive hover:text-destructive/80"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Imagens</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Arraste imagens ou clique para selecionar
                            </p>
                            <Input
                                type="file"
                                accept="image/*,.heic,.heif"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("image-upload")?.click()}
                            >
                                Selecionar Arquivos
                            </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {formData.images.map((img, index) => (
                                <div key={index} className="relative aspect-square border rounded overflow-hidden group">
                                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="bg-white text-black hover:bg-gray-100 font-bold" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Produto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductForm;
