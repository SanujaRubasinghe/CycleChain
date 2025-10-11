import Navigation from "@/components/Navigation";

export default function BikePurchaseLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {children}
    </div>
  );
}
