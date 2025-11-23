import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Diagnostics = () => {
    const { isAuthenticated } = useAuth();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const runTests = async () => {
        setLoading(true);
        const newResults = [];

        // Test 0: Environment Variables
        try {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_KEY;
            if (!url || !key) throw new Error("Variáveis de ambiente ausentes");
            newResults.push({
                name: "Variáveis de Ambiente",
                status: "OK",
                message: "URL e Key configuradas"
            });
        } catch (e: any) {
            newResults.push({ name: "Variáveis de Ambiente", status: "Erro", message: e.message });
        }

        // Test 1: Auth Status
        try {
            const { data: { session } } = await supabase.auth.getSession();
            newResults.push({
                name: "Autenticação",
                status: session ? "OK" : "Falha",
                message: session ? `Logado como: ${session.user.email}` : "Não há sessão ativa no Supabase"
            });
        } catch (e: any) {
            newResults.push({ name: "Autenticação", status: "Erro", message: e.message });
        }

        // Test 2: Database Connection (Read)
        try {
            const { data, error } = await supabase.from('collections').select('count').single();
            if (error) throw error;
            newResults.push({
                name: "Banco de Dados (Leitura)",
                status: "OK",
                message: "Conexão estabelecida com sucesso"
            });
        } catch (e: any) {
            newResults.push({ name: "Banco de Dados (Leitura)", status: "Erro", message: e.message });
        }

        // Test 3: Database Write (Insert/Delete)
        try {
            const testSlug = `test-${Date.now()}`;
            const { data, error } = await supabase.from('collections').insert({
                name: "Teste Diagnóstico",
                slug: testSlug,
                image: "https://via.placeholder.com/150",
                description: "Teste de escrita"
            }).select().single();

            if (error) throw error;

            // Cleanup
            if (data) {
                await supabase.from('collections').delete().eq('id', data.id);
            }

            newResults.push({
                name: "Banco de Dados (Escrita)",
                status: "OK",
                message: "Gravação e exclusão funcionaram"
            });
        } catch (e: any) {
            newResults.push({ name: "Banco de Dados (Escrita)", status: "Erro", message: e.message });
        }

        // Test 4: Storage Upload
        try {
            const blob = new Blob(["test"], { type: "text/plain" });
            const fileName = `diagnostic-${Date.now()}.txt`;
            const { error } = await supabase.storage.from('images').upload(fileName, blob);

            if (error) throw error;

            // Cleanup
            await supabase.storage.from('images').remove([fileName]);

            newResults.push({
                name: "Storage (Upload)",
                status: "OK",
                message: "Upload de arquivo funcionou"
            });
        } catch (e: any) {
            newResults.push({ name: "Storage (Upload)", status: "Erro", message: e.message });
        }

        setResults(newResults);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Diagnóstico do Sistema</h2>
                <Button onClick={runTests} disabled={loading}>
                    {loading ? "Rodando Testes..." : "Iniciar Diagnóstico"}
                </Button>
            </div>

            <div className="grid gap-4">
                {results.map((result, index) => (
                    <Card key={index} className={result.status === "OK" ? "border-green-500" : "border-red-500"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                {result.name}
                                <span className={result.status === "OK" ? "text-green-600" : "text-red-600"}>
                                    {result.status}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Diagnostics;
