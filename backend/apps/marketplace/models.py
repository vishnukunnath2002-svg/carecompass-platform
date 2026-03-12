"""
apps/marketplace — Products, orders, store inventory (TENANT schema)
Maps to: products, product_categories, orders, order_items,
         medical_store_profiles, store_inventory, store_orders, store_order_items
"""

from django.db import models
import uuid


class ProductCategory(models.Model):
    """Hierarchical product categories."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=100, null=True, blank=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children'
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return self.name


class Product(models.Model):
    """Medical product listed by a vendor tenant."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    sku = models.CharField(max_length=100, null=True, blank=True)
    category = models.ForeignKey(
        ProductCategory, null=True, blank=True, on_delete=models.SET_NULL
    )

    price = models.DecimalField(max_digits=12, decimal_places=2)
    mrp = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    moq = models.IntegerField(null=True, blank=True)
    stock_quantity = models.IntegerField(default=0)

    images = models.JSONField(default=list, blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    certifications = models.JSONField(default=list, blank=True)

    is_active = models.BooleanField(default=True)
    is_prescription_required = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    review_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return self.name


class Order(models.Model):
    """Vendor product order placed by a customer."""

    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
        ('disputed', 'Disputed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    customer_id = models.UUIDField(db_index=True)
    shipping_address_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    payment_status = models.CharField(max_length=50, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tax = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'marketplace'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random
            self.order_number = f"ORD{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    """Line item within a vendor order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


class MedicalStoreProfile(models.Model):
    """Medical store (pharmacy) profile."""

    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store_name = models.CharField(max_length=255)
    owner_name = models.CharField(max_length=100, null=True, blank=True)
    drug_licence_number = models.CharField(max_length=100, null=True, blank=True)
    gst_number = models.CharField(max_length=20, null=True, blank=True)
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS, default='pending'
    )

    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    catchment_pincodes = models.JSONField(default=list, blank=True)
    catchment_radius_km = models.IntegerField(null=True, blank=True)

    delivery_available = models.BooleanField(default=False)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    minimum_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    own_delivery_staff = models.BooleanField(default=False)
    operating_hours = models.JSONField(default=dict, blank=True)
    store_photos = models.JSONField(default=list, blank=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    review_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return self.store_name


class StoreInventoryItem(models.Model):
    """A medicine/product in a medical store's local inventory."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(MedicalStoreProfile, on_delete=models.CASCADE, related_name='inventory')
    product_name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=100, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    is_prescription_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return f"{self.product_name} @ {self.store.store_name}"


class StoreOrder(models.Model):
    """An order placed at a medical store."""

    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('returned', 'Returned'),
        ('disputed', 'Disputed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    store = models.ForeignKey(MedicalStoreProfile, on_delete=models.CASCADE, related_name='orders')
    customer_id = models.UUIDField(db_index=True)
    delivery_address_id = models.UUIDField(null=True, blank=True)
    prescription_id = models.UUIDField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(max_length=50, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'marketplace'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            import random
            self.order_number = f"SO{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"StoreOrder {self.order_number}"


class StoreOrderItem(models.Model):
    """Line item within a store order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store_order = models.ForeignKey(StoreOrder, on_delete=models.CASCADE, related_name='items')
    inventory_item = models.ForeignKey(
        StoreInventoryItem, null=True, blank=True, on_delete=models.SET_NULL
    )
    product_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'marketplace'

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
