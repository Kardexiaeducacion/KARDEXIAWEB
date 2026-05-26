import Link from "next/link";

const links = {
  Producto:  [
    { name: "Funciones",   href: "/tutoriales"  },
    { name: "Descargar",   href: "/descarga"    },
    { name: "Precios",     href: "/suscripcion" },
    { name: "Actualizaciones", href: "#"        },
  ],
  Soporte: [
    { name: "Documentación", href: "/tutoriales"  },
    { name: "Soporte Técnico", href: "/soporte"   },
    { name: "Comunidad",     href: "/comentarios" },
    { name: "Status",        href: "#"            },
  ],
  Legal: [
    { name: "Privacidad",  href: "#" },
    { name: "Términos",    href: "#" },
    { name: "Seguridad",   href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0d0d0d] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 pb-16 border-b border-white/10">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.1"/>
                  <path d="M8 10h6l4 6-4 6H8l4-6-4-6z" fill="#85d3c8"/>
                  <path d="M16 10h8l-4 6 4 6h-8l4-6-4-6z" fill="white" opacity="0.5"/>
                </svg>
              </div>
              <span className="text-[15px] font-bold tracking-[-0.02em]">Kardexia</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-8">
              La plataforma definitiva para la gestión académica. Diseñada para directores que exigen excelencia.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs text-white/40 border border-white/10 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#85d3c8]" />
                Todos los sistemas operativos
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} Kardexia. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-white/30 text-sm">
            <Link href="#" className="hover:text-white/70 transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Términos</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
