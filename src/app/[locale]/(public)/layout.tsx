import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";

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