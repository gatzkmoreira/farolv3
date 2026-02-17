import Header from "@/components/farol/Header";
import Footer from "@/components/farol/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEO from "@/components/SEO";

interface DataPageLayoutProps {
    title: string;
    description: string;
    path: string;
    breadcrumbs: { label: string; href: string }[];
    schema?: Record<string, unknown> | Record<string, unknown>[];
    children: React.ReactNode;
}

export default function DataPageLayout({
    title,
    description,
    path,
    breadcrumbs,
    schema,
    children,
}: DataPageLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <SEO title={title} description={description} path={path} schema={schema} />
            <Header />

            <main className="farol-container py-6">
                <Breadcrumbs items={breadcrumbs} />

                <div className="mt-4">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}
