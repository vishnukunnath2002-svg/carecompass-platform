import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Package, Star, ShoppingBag, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  brand: string | null;
  stock_quantity: number | null;
  rating: number | null;
  review_count: number | null;
  is_prescription_required: boolean | null;
  specifications: any;
  certifications: string[] | null;
  tenant_id: string;
  images: string[] | null;
}

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailDialog({ product, open, onOpenChange }: Props) {
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      brand: product.brand,
      tenantId: product.tenant_id,
      isPrescriptionRequired: !!product.is_prescription_required,
      source: 'vendor',
    });
    toast({ title: 'Added to cart', description: `${product.name} added to your cart.` });
  };

  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.name}
            {product.is_prescription_required && (
              <Badge variant="outline" className="border-destructive text-destructive text-xs">Rx Required</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image placeholder */}
          <div className="flex h-40 items-center justify-center rounded-xl bg-muted/50">
            <Package className="h-16 w-16 text-muted-foreground/20" />
          </div>

          {/* Brand & Rating */}
          <div className="flex items-center justify-between">
            {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
            {product.rating != null && product.rating > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-warning">
                <Star className="h-4 w-4 fill-warning" /> {product.rating}
                <span className="text-muted-foreground">({product.review_count} reviews)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                <Badge className="bg-success/10 text-success text-xs">{discount}% off</Badge>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.certifications.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
            </div>
          )}

          {/* Stock */}
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            {product.stock_quantity && product.stock_quantity > 0 ? (
              <span className="text-success font-medium">{product.stock_quantity} in stock</span>
            ) : (
              <span className="text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Out of stock
              </span>
            )}
          </div>

          <Button
            className="w-full gradient-primary border-0"
            disabled={!product.stock_quantity || product.stock_quantity === 0}
            onClick={handleAdd}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
