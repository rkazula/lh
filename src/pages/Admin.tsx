import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function Admin() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">0</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">$0.00</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Active Products</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">4</p></CardContent>
        </Card>
      </div>
      
      <div className="mt-8 p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
        Products management table placeholder
      </div>
    </div>
  );
}