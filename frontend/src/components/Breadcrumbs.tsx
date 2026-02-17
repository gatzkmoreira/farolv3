import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const allItems = [{ label: "Início", href: "/" }, ...items];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: allItems.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            item: `https://farolrural.com.br${item.href}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
                {allItems.map((item, i) => (
                    <span key={item.href} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="w-3 h-3" />}
                        {i === 0 && <Home className="w-3.5 h-3.5 mr-0.5" />}
                        {i < allItems.length - 1 ? (
                            <Link
                                to={item.href}
                                className="hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">{item.label}</span>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
}
