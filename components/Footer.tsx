// components/Footer.tsx

export function Footer() {
    return (
      <footer className="mt-12 border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} EastGarage · 东街车房 · All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-700">
              Terms
            </a>
            <a href="#" className="hover:text-slate-700">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    );
  }
  