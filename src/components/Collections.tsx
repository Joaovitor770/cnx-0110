const collections = [
  {
    name: "Masculino",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=500&q=80",
  },
  {
    name: "Feminino",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80",
  },
  {
    name: "Street",
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&q=80",
  },
  {
    name: "Acessórios",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=500&q=80",
  },
];

const Collections = () => {
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
            <a
              key={collection.name}
              href={`#${collection.name.toLowerCase()}`}
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
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
