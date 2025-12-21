import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import useDataPriceStore from "@/store/DataPrice";
import useUserDataStore from "@/store/UserData";
import { mapperSymbol } from "@/lib/mapper_symbol";
import { Order } from "@/schema/Order";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderFormProps {
  market: string;
}

export function OrderForm({ market }: OrderFormProps) {
  const { address } = useAccount();
  const priceDatasStore = useDataPriceStore((state) => state.priceDatas);
  const { balance, fetchBalance } = useUserDataStore();
  const [size, setSize] = useState("");
  const currentPrice = priceDatasStore?.[mapperSymbol[market]]?.tickPrice;

  const [order, setOrder] = useState<Partial<Order>>({
    pair: market,
    type: "MARKET",
    side: "LONG",
    entry_price: currentPrice?.toString() || "0.00",
    size: "0.00",
    leverage: 10,
    tp_price: "",
    sl_price: "",
  });

  useEffect(() => {
    if (address) {
      fetchBalance(address);
    }
  }, [address, fetchBalance]);

  useEffect(() => {
    if (order.type == "MARKET")
      setOrder((prevOrder) => ({
        ...prevOrder,
        entry_price:
          priceDatasStore?.[mapperSymbol[market]]?.tickPrice?.toString(),
      }));
  }, [priceDatasStore?.[mapperSymbol[market]]?.tickPrice]);

  const handleOrderTypeChange = (value: string) => {
    const newType = value.toUpperCase() as "MARKET" | "LIMIT";

    setOrder((prevOrder) => ({
      ...prevOrder,
      type: newType,
    }));
  };

  const handleInputChange = (field: keyof Order, value: any) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  };

  const validateAmount = (value: string, field: string) => {
    if (/^([1-9]\d*|0)(\.\d{0,2})?$/.test(value)) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [field]: value,
      }));
    } else if (value.length == 0) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [field]: "",
      }));
      return;
    } else {
      return;
    }
  };



  const handleOrder = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (order.size == "0.00" || order.size == "") {
      toast.error("Invalid size");
      return;
    }

    // Map frontend data to backend OrderRequest
    // market format expected: "BTC/USD" -> "BTC-USDZ"
    // This is a naive mapping based on observed patterns.
    const backendPair = market.replace("/", "-") + "Z";

    // Side mapping: LONG -> BUY, SHORT -> SELL
    const backendSide = order.side === "LONG" ? "BUY" : "SELL";

    // Validation for TP/SL
    const entryPrice = parseFloat(order.entry_price || "0");
    const tpPrice = parseFloat(order.tp_price || "0");
    const slPrice = parseFloat(order.sl_price || "0");

    if (entryPrice > 0) {
      if (order.side === "LONG") {
        if (tpPrice > 0 && tpPrice <= entryPrice) {
          toast.error("For Long, Take Profit must be greater than Entry Price");
          return;
        }
        if (slPrice > 0 && slPrice >= entryPrice) {
          toast.error("For Long, Stop Loss must be less than Entry Price");
          return;
        }
      } else {
        // SHORT
        if (tpPrice > 0 && tpPrice >= entryPrice) {
          toast.error("For Short, Take Profit must be less than Entry Price");
          return;
        }
        if (slPrice > 0 && slPrice <= entryPrice) {
          toast.error("For Short, Stop Loss must be greater than Entry Price");
          return;
        }
      }
    }

    const payload = {
      senderAddress: address,
      pair: backendPair,
      side: backendSide,
      type: order.type,
      entryPrice: order.entry_price || "0",
      sizeQuote: order.size,
      leverage: order.leverage,
      exitPrice: "0",
      tpPrice: order.tp_price || "0",
      slPrice: order.sl_price || "0",
      liqPrice: "0", // Backend calculates or expects 0? Passing 0 for now
    };

    console.log("Payload:", payload);

    try {
      const response = await fetch("http://localhost:8081/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Order placed successfully");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to connect to trading service");
    }
  };

  const calculateLiquidationPrice = () => {
    const entryPrice = parseFloat(order.entry_price || "0");
    const leverage = order.leverage || 1;

    if (!entryPrice || entryPrice <= 0) return "--";

    let liquidationPrice = 0;
    if (order.side === "LONG") {
      liquidationPrice = entryPrice * (1 - 1 / leverage);
    } else {
      liquidationPrice = entryPrice * (1 + 1 / leverage);
    }

    return liquidationPrice.toFixed(2);
  };

  return (
    <Card className="flex h-full flex-col rounded-none border-0 p-4">
      <h2 className="mb-1 text-lg font-semibold text-center">Place Order</h2>

      <Tabs
        defaultValue="market"
        className="mb-4"
        onValueChange={handleOrderTypeChange}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button
          variant={order.side === "LONG" ? "default" : "outline"}
          onClick={() => handleInputChange("side", "LONG")}
          className={
            order.side === "LONG"
              ? "bg-success text-white hover:bg-success/90"
              : "border-success/50 text-success hover:bg-success/10"
          }
        >
          Long
        </Button>
        <Button
          variant={order.side === "SHORT" ? "default" : "outline"}
          onClick={() => handleInputChange("side", "SHORT")}
          className={
            order.side === "SHORT"
              ? "bg-destructive text-white hover:bg-destructive/90"
              : "border-destructive/50 text-destructive hover:bg-destructive/10"
          }
        >
          Short
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-xs text-muted-foreground flex items-center gap-1">
            Est. Entry Price
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The approximate price at which your order will be executed. Final price may vary due to market slippage or fees.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="price"
            type="text"
            disabled={order.type === "MARKET"}
            value={order.entry_price ?? ""}
            onChange={(e) => {
              validateAmount(e.target.value, "entry_price");
            }}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size" className="text-xs text-muted-foreground flex items-center gap-1">
            Est. Size (USD)
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The approximate quantity of coins for your position based on the current market price.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="size"
            type="text"
            placeholder="0.00"
            value={order.size}
            onChange={(e) => validateAmount(e.target.value, "size")}
            className="font-mono"
          />
          <div className="flex gap-1">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                variant="ghost"
                size="sm"
                className="h-6 flex-1 text-xs"
                onClick={() => setSize((parseFloat(balance.replace(/,/g, '')) * (percent / 100)).toString())}
              >
                {percent}%
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Leverage</Label>
            <span className="font-mono text-sm font-semibold text-primary">
              {order.leverage}x
            </span>
          </div>
          <Slider
            value={[order.leverage || 10]}
            onValueChange={(val) => handleInputChange("leverage", val[0])}
            min={1}
            max={50}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1x</span>
            <span>50x</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tp" className="text-xs text-muted-foreground">
            Take Profit (Optional)
          </Label>
          <Input
            id="tp"
            type="text"
            className="font-mono"
            value={order.tp_price}
            onChange={(e) => validateAmount(e.target.value, "tp_price")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sl" className="text-xs text-muted-foreground">
            Stop Loss (Optional)
          </Label>
          <Input
            id="sl"
            type="text"
            className="font-mono"
            value={order.sl_price}
            onChange={(e) => validateAmount(e.target.value, "sl_price")}
          />
        </div>
      </div>

      <div className="mt-1 space-y-2 rounded-lg bg-muted/50 p-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Est. Entry Price
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The approximate price at which your order will be executed. Final price may vary due to market slippage.</p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-mono">${order.entry_price ?? "--"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Est. Size (Coin)
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The approximate quantity of coins for your position based on the current market price.</p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-mono">
            {order.size &&
              order.entry_price &&
              parseFloat(order.entry_price) > 0
              ? (
                parseFloat(order.size) / parseFloat(order.entry_price)
              ).toFixed(3)
              : "--"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Est. Margin
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The estimated amount of collateral required to open and maintain this position. Actual margin may vary.</p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-mono">
            $
            {order.size && order.leverage
              ? (parseFloat(order.size) / order.leverage).toFixed(2)
              : "--"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Est. Liquidation Price
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The estimated price at which your position will be automatically closed to prevent further losses. This value constantly updates.</p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-mono">${calculateLiquidationPrice()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Est. Fees</span>
          <span className="font-mono">$2.45</span>
        </div>
      </div>

      <Button
        className={`mt-1 w-full font-semibold transition-all hover:scale-105 ${order.side === "LONG"
          ? "bg-success text-white hover:bg-success/90"
          : "bg-destructive text-white hover:bg-destructive/90"
          }`}
        onClick={handleOrder}
      >
        {order.side === "LONG" ? "Open Long" : "Open Short"}
      </Button>

      <div className=" text-center text-xs text-muted-foreground">
        Available Balance:{" "}
        <span className="font-mono font-semibold">${balance}</span>
      </div>
    </Card>
  );
}
