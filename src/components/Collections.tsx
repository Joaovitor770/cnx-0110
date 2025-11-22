import { useCollections } from "@/contexts/CollectionContext";
import { Link } from "react-router-dom";

const Collections = () => {
  const { collections } = useCollections();

  if (collections.length === 0) return null;

  return (
    <section className="py-20 bg-secondary" id="collections">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-impact text-4xl md:text-6xl text-foreground mb-4 uppercase">
            Coleções
          </h2>
          <p className="text-muted-foreground tracking-wider uppercase text-sm">
            Explore nosso catálogo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="group relative overflow-hidden aspect-[3/4] rounded-sm"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-impact text-3xl text-foreground uppercase group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
