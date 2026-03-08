
-- Allow vendors to read orders for their tenant
CREATE POLICY "Vendors see tenant orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.tenant_id = orders.tenant_id
  )
);

-- Allow vendors to update orders for their tenant
CREATE POLICY "Vendors update tenant orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.tenant_id = orders.tenant_id
  )
);

-- Allow store staff to see their store orders
CREATE POLICY "Store staff see store orders"
ON public.store_orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.medical_store_profiles msp ON msp.tenant_id = ur.tenant_id
    WHERE ur.user_id = auth.uid()
    AND msp.id = store_orders.store_id
  )
);

-- Allow store staff to update their store orders
CREATE POLICY "Store staff update store orders"
ON public.store_orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.medical_store_profiles msp ON msp.tenant_id = ur.tenant_id
    WHERE ur.user_id = auth.uid()
    AND msp.id = store_orders.store_id
  )
);

-- Providers can see bookings assigned to them
CREATE POLICY "Providers see assigned bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = provider_id);

-- Providers can update bookings assigned to them
CREATE POLICY "Providers update assigned bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = provider_id);

-- Customers can update own bookings (for cancellation etc)
CREATE POLICY "Customers update own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id);

-- Providers can insert vitals (fix: they query by user_id not provider_id)
-- Already exists via "Providers log vitals" policy

-- Allow providers to see notifications
-- Already covered by "Users see own notifications"
