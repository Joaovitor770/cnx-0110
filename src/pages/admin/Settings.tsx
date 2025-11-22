import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { Upload, X } from "lucide-react";

const Settings = () => {
    const { settings, updateSettings } = useSettings();
    const [formData, setFormData] = useState(settings);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (field: "logo" | "banner") => {
        setFormData((prev) => ({ ...prev, [field]: null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Configurações da Loja</h2>
                <Button onClick={handleSubmit}>Salvar Alterações</Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Gerais</CardTitle>
                        <CardDescription>
                            Detalhes básicos da sua loja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="storeName">Nome da Loja</Label>
                            <Input
                                id="storeName"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="shippingPrice">Valor do Frete (R$)</Label>
                            <Input
                                id="shippingPrice"
                                name="shippingPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.shippingPrice}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        shippingPrice: parseFloat(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contato</CardTitle>
                        <CardDescription>
                            Informações de contato exibidas para os clientes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="contactEmail">Email de Contato</Label>
                                <Input
                                    id="contactEmail"
                                    name="contactEmail"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contactPhone">Telefone / WhatsApp</Label>
                                <Input
                                    id="contactPhone"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>



            </div>
        </div>
    );
};

export default Settings;
