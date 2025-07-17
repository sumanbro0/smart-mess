import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";
import { memo, useCallback } from "react";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    primary_image?: string;
  };
  quantity: number;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  currency: string;
}

// Memoized cart item component for better performance
const CartItem: React.FC<CartItemProps> = memo(
  ({ item, quantity, onQuantityChange, onRemove, currency }) => {
    const handleDecrease = useCallback(() => {
      onQuantityChange(item.id, quantity - 1);
    }, [item.id, quantity, onQuantityChange]);

    const handleIncrease = useCallback(() => {
      onQuantityChange(item.id, quantity + 1);
    }, [item.id, quantity, onQuantityChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) onQuantityChange(item.id, val);
      },
      [item.id, onQuantityChange]
    );

    const handleRemove = useCallback(() => {
      onRemove(item.id);
    }, [item.id, onRemove]);

    return (
      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors group relative">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-foreground shadow-sm transition-all duration-200"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <X className="w-3 h-3" />
        </Button>

        <div className="relative">
          {item.primary_image ? (
            <img
              src={item.primary_image}
              alt={item.name}
              className="w-14 h-14 object-cover rounded-md border shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 flex items-center justify-center bg-muted rounded-md border text-lg">
              🍽️
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <h4 className="font-medium text-sm text-foreground leading-tight mb-1">
            {item.name}
          </h4>
          <p className="text-sm font-semibold text-primary mb-2">
            {currency}
            {item.price.toFixed(2)}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 rounded-md"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </Button>

            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={handleInputChange}
              className="w-12 h-7 text-center text-sm font-medium border-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 rounded-md"
              onClick={handleIncrease}
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </Button>

            <span className="ml-auto text-sm font-medium">
              {currency}
              {(item.price * quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

CartItem.displayName = "CartItem";
export default CartItem;
