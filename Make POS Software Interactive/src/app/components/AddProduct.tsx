import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { ArrowLeft } from "lucide-react";

interface AddProductProps {
  onBack: () => void;
  onAdd: (product: any) => void;
}

export default function AddProduct({ onBack, onAdd }: AddProductProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    barcode: "",
    batchNo: "",
    unit: "Tablet",
    price: "",
    stock: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "code" || name === "barcode") {
      setFormData((prev) => ({ ...prev, code: value, barcode: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    });
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#727681] hover:text-[#0e101a] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">Back to POS</span>
        </button>

        <Card className="border-[#eaeaea] shadow-sm">
          <CardHeader className="border-b border-[#eaeaea] pb-4">
            <CardTitle className="font-['Inter:Bold',sans-serif] text-[20px] text-[#0e101a]">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0e101a]">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-[#0e101a]">Product Code / Barcode</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    placeholder="Scan or enter code"
                    value={formData.barcode}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchNo" className="text-[#0e101a]">Batch Number</Label>
                  <Input
                    id="batchNo"
                    name="batchNo"
                    placeholder="Enter batch number"
                    value={formData.batchNo}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-[#0e101a]">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="e.g. Tablet, Bottle"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[#0e101a]">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-[#0e101a]">Initial Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="border-[#eaeaea]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 border-[#eaeaea] text-[#727681]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#1f7fff] hover:bg-[#1f7fff]/90 text-white"
                >
                  Add Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
