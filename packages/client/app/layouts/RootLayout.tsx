import { Outlet } from 'react-router';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
