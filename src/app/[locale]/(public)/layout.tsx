import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header variant="transparent-V2" />
            <main className="bg-[#121316] pb-24 lg:pb-30">
                {children}
            </main>
            <Footer />
        </>
    );
}

export default Layout;