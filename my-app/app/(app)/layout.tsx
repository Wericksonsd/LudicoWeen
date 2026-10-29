import Header from "../components/header";
import Footer from "../components/footer";
import RotaProtegida from "../components/rotaProtegida";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RotaProtegida>
      <Header />
      {children}
      <Footer />
    </RotaProtegida>
  );
}
