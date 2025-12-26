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
import { Product, ProductColor } from "@/contexts/ProductContext";
import { useCollections } from "@/contexts/CollectionContext";
import { useCategories } from "@/contexts/CategoryContext";
import { X, Plus, Upload, Palette } from "lucide-react";
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
        categoryId: undefined as number | undefined,
        colors: [] as Omit<ProductColor, "id" | "productId">[],
    });

    const [newSize, setNewSize] = useState("");
    const [newStock, setNewStock] = useState("");

    // Color State
    const [newColorName, setNewColorName] = useState("");
    const [newColorValue, setNewColorValue] = useState("#000000");
    const [newColorImages, setNewColorImages] = useState<string[]>([]);

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
                categoryId: initialData.categoryId || (initialData.category ? categories.find(c => c.name === initialData.category)?.id : undefined),
                colors: initialData.colors || [],
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
                colors: [],
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

    const processImages = async (files: FileList): Promise<string[]> => {
        const fileArray = Array.from(files);
        const processedImages: string[] = [];

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

                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    fileToProcess = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
                } catch (error) {
                    console.error("Error converting HEIC:", error);
                }
            }

            // Read as Data URL
            await new Promise<void>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result) {
                        processedImages.push(reader.result as string);
                    }
                    resolve();
                };
                reader.readAsDataURL(fileToProcess);
            });
        }
        return processedImages;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setIsLoading(true);
            try {
                const newImages = await processImages(files);
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

    const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setIsLoading(true);
            try {
                const newImages = await processImages(files);
                setNewColorImages((prev) => [...prev, ...newImages]);
            } catch (error) {
                console.error("Error processing color images:", error);
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

    const removeColorImage = (index: number) => {
        setNewColorImages((prev) => prev.filter((_, i) => i !== index));
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

    const addColor = () => {
        if (newColorName && newColorValue) {
            setFormData((prev) => ({
                ...prev,
                colors: [...(prev.colors || []), {
                    name: newColorName,
                    colorValue: newColorValue,
                    images: newColorImages
                }],
            }));
            setNewColorName("");
            setNewColorValue("#000000");
            setNewColorImages([]);
        }
    };

    const removeColor = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            colors: (prev.colors || []).filter((_, i) => i !== index),
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

                    {/* Color Variations Section */}
                    <div className="space-y-2 border-t pt-4">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Variações de Cores
                        </Label>

                        {/* List Existing Colors */}
                        <div className="space-y-2">
                            {formData.colors?.map((color, index) => (
                                <div key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full border shadow-sm"
                                            style={{ backgroundColor: color.colorValue }}
                                        />
                                        <div>
                                            <p className="font-medium">{color.name}</p>
                                            <p className="text-xs text-muted-foreground">{color.images.length} imagens</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/80"
                                        onClick={() => removeColor(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Color Form */}
                        <div className="bg-muted/40 p-4 rounded-lg space-y-4 border border-blue-100/20">
                            <h4 className="text-sm font-medium">Adicionar Nova Cor</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Nome (ex: Azul Marinho)"
                                    value={newColorName}
                                    onChange={(e) => setNewColorName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        className="w-12 p-1 cursor-pointer"
                                        value={newColorValue}
                                        onChange={(e) => setNewColorValue(e.target.value)}
                                    />
                                    <Input
                                        placeholder="#000000"
                                        value={newColorValue}
                                        onChange={(e) => setNewColorValue(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Imagens desta cor</Label>
                                <div className="flex flex-wrap gap-2">
                                    {newColorImages.map((img, idx) => (
                                        <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeColorImage(idx)}
                                                className="absolute top-0 right-0 bg-black/60 text-white rounded-bl p-[2px]"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer hover:bg-muted/50">
                                        <Upload className="w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleColorImageUpload}
                                        />
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={addColor}
                                disabled={!newColorName}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Variação
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Imagens Principais (Padrão)</Label>
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
