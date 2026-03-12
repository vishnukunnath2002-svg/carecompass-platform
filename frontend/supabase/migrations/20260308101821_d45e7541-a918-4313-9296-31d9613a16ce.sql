
-- Allow authenticated users to insert order_items (needed for checkout)
CREATE POLICY "Customers insert order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
);

-- Allow authenticated users to insert store_order_items (needed for checkout)
CREATE POLICY "Customers insert store order items"
ON public.store_order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.store_orders
    WHERE store_orders.id = store_order_items.store_order_id
    AND store_orders.customer_id = auth.uid()
  )
);

-- Allow authenticated users to insert wallet transactions for their own records
CREATE POLICY "Users insert own wallet txns"
ON public.wallet_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert invoices for themselves
CREATE POLICY "Users insert own invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
