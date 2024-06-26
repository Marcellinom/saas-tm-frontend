import Image from "next/image"
import { PlusCircledIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useContext, useEffect, useState } from "react"
import { OrganizationContext } from "@/providers/OrganizationProvider";
import { AuthContext } from "@/providers/AuthProvider"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner"

export interface Tenant {
  tenant_id: number;
  name: string;
  status: string;
  resource_information: {
    compute_url?: string | null
    app_icon?: string | null
    tenant_icon?: string | null
  }
  product_id: string;
  tier: string;
  app_name: string
  app_id: number
}

const TenantStatusColor: Readonly<Record<string, string>> = {
  "activated": "text-green-700",
  "deactivated": "text-red-700",
}

interface TenantProps extends React.HTMLAttributes<HTMLDivElement> {
  tenant: Tenant
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
}

export function TenantList({
  tenant,
  aspectRatio = "square",
  width,
  height,
  className,
  ...props
}: TenantProps) {
  const { selectedOrganization, organizations } = useContext(OrganizationContext);
  const { userInfo } = useContext(AuthContext);

  const [isDialogOpen, setisDialogOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean | null>(null);

  type Price = {
    id: string | null;
    product_id: string | null
    price_value: number;
    recurrence: string | null;
  }

  type Product = {
    id: string;
    app_id: number;
    tenant: Tenant | null;
    tier_name: string;
    prices: Price[];
  }

  type OnboardingProductResponse = {
    id: string;
    app_id: number;
    tenant: Tenant | null;
    tier_name: string;
    price: {
      id: string | null;
      product_id: string | null
      price: number;
      reccurence: string | null;
    }[];
  }

  useEffect(() => {
    const fetchProducts = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BILLING}/api/v1/products/${tenant.app_id}`);
          const data = await response.json();

          let products: Product[] = []
          console.log("PRICE", data)
          data.data.forEach((resProduct: OnboardingProductResponse) => {
            let product: Product = {
              id: resProduct.id,
              app_id: resProduct.app_id,
              tenant: null,
              tier_name: resProduct.tier_name,
              prices: resProduct.price.map(p => {
                return {
                  id: p.id,
                  product_id: p.product_id,
                  price_value: p.price,
                  recurrence: p.reccurence
                }
              }),
            }

            products.push(product)
          });

          setProducts(products);

        } catch (error) {
          console.error("error fetching products: ", error);
        }
      } 
    if (isDialogOpen) fetchProducts();
  }, [isDialogOpen, tenant]);

  const handleChange = (open: boolean) => {
    if (!open) {
      setPrices([])
      setSelectedPrice(null)
      setSelectedProduct(null)
    }
    setisDialogOpen(open)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TENANT_MANAGEMENT_API}/tenant/change_tier`, {
        method: "POST", // Changed to POST for creation
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          new_product_id: selectedProduct?.id,
          tenant_id: tenant.tenant_id,
        })
      });
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        setDialogOpen(null)
        setisDialogOpen(false)
        setTimeout(() => setAlert(null), 3000); // Hide alert after 3 seconds
      }
    } catch (error) {
      console.error("Error during tenant creation:", error);
    }
    toast.success("Product successfully bought", {
      description: "Please resolve payment on Billing"
    })
  }

  return (
    <>
      {alert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <Alert>
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Please wait for up to 10 minutes for migrating tenant to new infrastructure.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      <Dialog onOpenChange={handleChange} open={isDialogOpen}>
        <DialogTrigger asChild>
          <div className={cn("flex items-center space-x-4 h-50 hover:bg-gray-200 rounded-lg", className)} {...props}>
            <div className="space-x-4 overflow-hidden rounded-sm">
              <Image
                src={(tenant.resource_information.tenant_icon || tenant.resource_information.app_icon) ?? ""}
                alt={tenant.name}
                width={width}
                height={height}
                className={cn(
                  "w-20 h-20 p-2 rounded-lg object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )}
              />
            </div>
            <div className="text-sm">
              <h3 className="font-medium leading-none">{tenant.name} - {tenant.tier}</h3>
              <h4 className={`${tenant.status in TenantStatusColor ? TenantStatusColor[tenant.status] : "text-yellow-600"} font-extrabold`}>{tenant.status}</h4>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent>
          <div className="flex items-center">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center justify-between">
                  <Image
                    src={(tenant.resource_information.tenant_icon || tenant.resource_information.app_icon) ?? ""}
                    alt={tenant.name}
                    width={width}
                    height={height}
                    className={cn(
                      "w-12 h-12 p-2 rounded-lg object-cover transition-all hover:scale-105",
                      aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                    )}
                  />
                  <div>
                    <p>{tenant.name}</p>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription>
                      Change {tenant.app_name} tier, choose from available tiers and price below
          </DialogDescription>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="tier" className="pb-2">Change Tiers</Label>
                <Select onValueChange={(value) => {
                  let product = products.find(p => p.id === value);
                  setPrices(product?.prices ?? []);
                  setSelectedProduct(product ?? null)
                }}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {products.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id}>{product.tier_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {prices && <div className="flex flex-col space-y-1.5">
                <Label htmlFor="price" className="pb-2">Prices</Label>
                <Select onValueChange={(value) => {
                  const price = prices.find(p => p.id === value);
                  setSelectedPrice(price ?? null);
                  console.log(price);
                }}>
                  <SelectTrigger id="price">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {prices.map((price: Price, i) => {
                      console.log(price)
                      return <SelectItem key={`${price.id}-${i}`} value={`${price.id}|${i}`}>{price.price_value} - {price.recurrence}</SelectItem>
                    })}
                  </SelectContent>
                </Select>
              </div>}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}