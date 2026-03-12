from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserRole, Profile

class UserRoleInline(admin.TabularInline):
    model = UserRole
    extra = 1

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_active', 'is_staff')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('email',)
    
    # Required for custom un-username'd base
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    inlines = [ProfileInline, UserRoleInline]

@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'tenant_id')
    search_fields = ('user__email', 'role')
    list_filter = ('role',)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'date_of_birth')
    search_fields = ('user__email',)
    list_filter = ('gender',)
