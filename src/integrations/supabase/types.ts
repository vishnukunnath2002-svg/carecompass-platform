export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean | null
          label: string | null
          lat: number | null
          lng: number | null
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat?: number | null
          lng?: number | null
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat?: number | null
          lng?: number | null
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      agency_services: {
        Row: {
          assigned_staff: string[] | null
          conditions_served: string[] | null
          created_at: string | null
          description: string | null
          equipment_suggestions: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price_daily: number | null
          price_hourly: number | null
          price_weekly: number | null
          rating: number | null
          review_count: number | null
          service_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_staff?: string[] | null
          conditions_served?: string[] | null
          created_at?: string | null
          description?: string | null
          equipment_suggestions?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price_daily?: number | null
          price_hourly?: number | null
          price_weekly?: number | null
          rating?: number | null
          review_count?: number | null
          service_type: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_staff?: string[] | null
          conditions_served?: string[] | null
          created_at?: string | null
          description?: string | null
          equipment_suggestions?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_daily?: number | null
          price_hourly?: number | null
          price_weekly?: number | null
          rating?: number | null
          review_count?: number | null
          service_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          add_ons: Json | null
          address_id: string | null
          agency_service_id: string | null
          booking_number: string
          commission_amount: number | null
          created_at: string
          customer_id: string
          end_date: string | null
          end_time: string | null
          id: string
          notes: string | null
          patient_condition: string | null
          patient_profile_id: string | null
          payment_status: string | null
          provider_id: string | null
          service_category_id: string | null
          service_type: string | null
          shift_type: string | null
          specialization_required: string[] | null
          start_date: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          tenant_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          add_ons?: Json | null
          address_id?: string | null
          agency_service_id?: string | null
          booking_number?: string
          commission_amount?: number | null
          created_at?: string
          customer_id: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_condition?: string | null
          patient_profile_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          service_category_id?: string | null
          service_type?: string | null
          shift_type?: string | null
          specialization_required?: string[] | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          add_ons?: Json | null
          address_id?: string | null
          agency_service_id?: string | null
          booking_number?: string
          commission_amount?: number | null
          created_at?: string
          customer_id?: string
          end_date?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          patient_condition?: string | null
          patient_profile_id?: string | null
          payment_status?: string | null
          provider_id?: string | null
          service_category_id?: string | null
          service_type?: string | null
          shift_type?: string | null
          specialization_required?: string[] | null
          start_date?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          tenant_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_agency_service_id_fkey"
            columns: ["agency_service_id"]
            isOneToOne: false
            referencedRelation: "agency_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "caregiver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_profiles: {
        Row: {
          available_days: string[] | null
          available_hours: Json | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bio: string | null
          created_at: string
          daily_rate: number | null
          documents: Json | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          lat: number | null
          lng: number | null
          preferred_areas: string[] | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          qualification: string | null
          rating: number | null
          registration_number: string | null
          review_count: number | null
          skills: string[] | null
          specializations: string[] | null
          tenant_id: string | null
          travel_radius_km: number | null
          updated_at: string
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          weekly_rate: number | null
          years_experience: number | null
        }
        Insert: {
          available_days?: string[] | null
          available_hours?: Json | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          documents?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          preferred_areas?: string[] | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          qualification?: string | null
          rating?: number | null
          registration_number?: string | null
          review_count?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          tenant_id?: string | null
          travel_radius_km?: number | null
          updated_at?: string
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          weekly_rate?: number | null
          years_experience?: number | null
        }
        Update: {
          available_days?: string[] | null
          available_hours?: Json | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bio?: string | null
          created_at?: string
          daily_rate?: number | null
          documents?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          preferred_areas?: string[] | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          qualification?: string | null
          rating?: number | null
          registration_number?: string | null
          review_count?: number | null
          skills?: string[] | null
          specializations?: string[] | null
          tenant_id?: string | null
          travel_radius_km?: number | null
          updated_at?: string
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          weekly_rate?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "caregiver_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          created_at: string
          flat_fee: number | null
          id: string
          is_active: boolean | null
          name: string
          percentage: number
          tenant_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          percentage: number
          tenant_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          flat_fee?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          percentage?: number
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          description: string | null
          dispute_type: string
          id: string
          reference_id: string
          resolution: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dispute_type: string
          id?: string
          reference_id: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dispute_type?: string
          id?: string
          reference_id?: string
          resolution?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_profiles: {
        Row: {
          accounts_email: string | null
          billing_address: string | null
          contact_person_name: string | null
          contact_person_role: string | null
          created_at: string
          credit_requested: boolean | null
          discharge_coordination: boolean | null
          hospital_name: string
          id: string
          nursing_manager: boolean | null
          payment_preference: string | null
          po_format: string | null
          procurement_enabled: boolean | null
          registration_certificate: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accounts_email?: string | null
          billing_address?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          created_at?: string
          credit_requested?: boolean | null
          discharge_coordination?: boolean | null
          hospital_name: string
          id?: string
          nursing_manager?: boolean | null
          payment_preference?: string | null
          po_format?: string | null
          procurement_enabled?: boolean | null
          registration_certificate?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accounts_email?: string | null
          billing_address?: string | null
          contact_person_name?: string | null
          contact_person_role?: string | null
          created_at?: string
          credit_requested?: boolean | null
          discharge_coordination?: boolean | null
          hospital_name?: string
          id?: string
          nursing_manager?: boolean | null
          payment_preference?: string | null
          po_format?: string | null
          procurement_enabled?: boolean | null
          registration_certificate?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_quotes: {
        Row: {
          delivery_timeline: string | null
          id: string
          items: Json
          rfq_id: string
          status: string | null
          submitted_at: string
          terms: string | null
          total_amount: number | null
          vendor_tenant_id: string
        }
        Insert: {
          delivery_timeline?: string | null
          id?: string
          items?: Json
          rfq_id: string
          status?: string | null
          submitted_at?: string
          terms?: string | null
          total_amount?: number | null
          vendor_tenant_id: string
        }
        Update: {
          delivery_timeline?: string | null
          id?: string
          items?: Json
          rfq_id?: string
          status?: string | null
          submitted_at?: string
          terms?: string | null
          total_amount?: number | null
          vendor_tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "hospital_rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_quotes_vendor_tenant_id_fkey"
            columns: ["vendor_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_rfqs: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          hospital_tenant_id: string
          id: string
          items: Json
          rfq_number: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          hospital_tenant_id: string
          id?: string
          items?: Json
          rfq_number?: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          hospital_tenant_id?: string
          id?: string
          items?: Json
          rfq_number?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_rfqs_hospital_tenant_id_fkey"
            columns: ["hospital_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string
          pdf_url: string | null
          reference_id: string
          tax: number | null
          total: number
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          reference_id: string
          tax?: number | null
          total: number
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          pdf_url?: string | null
          reference_id?: string
          tax?: number | null
          total?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_store_profiles: {
        Row: {
          catchment_pincodes: string[] | null
          catchment_radius_km: number | null
          created_at: string
          delivery_available: boolean | null
          delivery_fee: number | null
          drug_licence_number: string | null
          gst_number: string | null
          id: string
          lat: number | null
          lng: number | null
          minimum_order_value: number | null
          operating_hours: Json | null
          own_delivery_staff: boolean | null
          owner_name: string | null
          rating: number | null
          review_count: number | null
          store_name: string
          store_photos: string[] | null
          tenant_id: string
          updated_at: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          catchment_pincodes?: string[] | null
          catchment_radius_km?: number | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_fee?: number | null
          drug_licence_number?: string | null
          gst_number?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          minimum_order_value?: number | null
          operating_hours?: Json | null
          own_delivery_staff?: boolean | null
          owner_name?: string | null
          rating?: number | null
          review_count?: number | null
          store_name: string
          store_photos?: string[] | null
          tenant_id: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          catchment_pincodes?: string[] | null
          catchment_radius_km?: number | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_fee?: number | null
          drug_licence_number?: string | null
          gst_number?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          minimum_order_value?: number | null
          operating_hours?: Json | null
          own_delivery_staff?: boolean | null
          owner_name?: string | null
          rating?: number | null
          review_count?: number | null
          store_name?: string
          store_photos?: string[] | null
          tenant_id?: string
          updated_at?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_store_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_fee: number | null
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number | null
          tax: number | null
          tenant_id: string | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          tax?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_fee?: number | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          tax?: number | null
          tenant_id?: string | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          age: number | null
          allergies: string[] | null
          blood_group: string | null
          created_at: string
          current_medications: string[] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          medical_conditions: string[] | null
          patient_name: string
          special_care_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          medical_conditions?: string[] | null
          patient_name: string
          special_care_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          medical_conditions?: string[] | null
          patient_name?: string
          special_care_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string
          id: string
          processed_at: string | null
          reference_id: string | null
          status: string | null
          tenant_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          tenant_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          processed_at?: string | null
          reference_id?: string | null
          status?: string | null
          tenant_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_partnerships: {
        Row: {
          agency_tenant_id: string
          created_at: string
          id: string
          notes: string | null
          status: string
          store_tenant_id: string
          updated_at: string
        }
        Insert: {
          agency_tenant_id: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          store_tenant_id: string
          updated_at?: string
        }
        Update: {
          agency_tenant_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          store_tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_partnerships_agency_tenant_id_fkey"
            columns: ["agency_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_partnerships_store_tenant_id_fkey"
            columns: ["store_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_referrals: {
        Row: {
          agency_tenant_id: string
          booking_id: string | null
          created_at: string
          id: string
          partnership_id: string | null
          patient_user_id: string | null
          reason: string | null
          status: string | null
          store_tenant_id: string
        }
        Insert: {
          agency_tenant_id: string
          booking_id?: string | null
          created_at?: string
          id?: string
          partnership_id?: string | null
          patient_user_id?: string | null
          reason?: string | null
          status?: string | null
          store_tenant_id: string
        }
        Update: {
          agency_tenant_id?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          partnership_id?: string | null
          patient_user_id?: string | null
          reason?: string | null
          status?: string | null
          store_tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_referrals_agency_tenant_id_fkey"
            columns: ["agency_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_referrals_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_referrals_store_tenant_id_fkey"
            columns: ["store_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_name: string | null
          file_url: string
          hospital_name: string | null
          id: string
          is_verified: boolean | null
          max_reuse: number | null
          notes: string | null
          patient_profile_id: string | null
          prescribed_date: string | null
          reuse_allowed: boolean | null
          reuse_count: number | null
          user_id: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          doctor_name?: string | null
          file_url: string
          hospital_name?: string | null
          id?: string
          is_verified?: boolean | null
          max_reuse?: number | null
          notes?: string | null
          patient_profile_id?: string | null
          prescribed_date?: string | null
          reuse_allowed?: boolean | null
          reuse_count?: number | null
          user_id: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          doctor_name?: string | null
          file_url?: string
          hospital_name?: string | null
          id?: string
          is_verified?: boolean | null
          max_reuse?: number | null
          notes?: string | null
          patient_profile_id?: string | null
          prescribed_date?: string | null
          reuse_allowed?: boolean | null
          reuse_count?: number | null
          user_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_prescription_required: boolean | null
          moq: number | null
          mrp: number | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          sku: string | null
          slug: string | null
          specifications: Json | null
          stock_quantity: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          moq?: number | null
          mrp?: number | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          moq?: number | null
          mrp?: number | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          slug?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_modules: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_value: number | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_modules?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_modules?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          hospital_tenant_id: string
          id: string
          items: Json
          po_number: string
          quote_id: string | null
          status: string | null
          total_amount: number | null
          vendor_tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          hospital_tenant_id: string
          id?: string
          items?: Json
          po_number?: string
          quote_id?: string | null
          status?: string | null
          total_amount?: number | null
          vendor_tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          hospital_tenant_id?: string
          id?: string
          items?: Json
          po_number?: string
          quote_id?: string | null
          status?: string | null
          total_amount?: number | null
          vendor_tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_hospital_tenant_id_fkey"
            columns: ["hospital_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "hospital_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_tenant_id_fkey"
            columns: ["vendor_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          rating: number
          target_id: string
          target_type: string
          title: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating: number
          target_id: string
          target_type: string
          title?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          target_id?: string
          target_type?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      specialization_tags: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      store_inventory: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_prescription_required: boolean | null
          price: number
          product_name: string
          stock_quantity: number | null
          store_id: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          price: number
          product_name: string
          stock_quantity?: number | null
          store_id: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_prescription_required?: boolean | null
          price?: number
          product_name?: string
          stock_quantity?: number | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "medical_store_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_order_items: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string | null
          product_name: string
          quantity: number
          store_order_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          product_name: string
          quantity?: number
          store_order_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string | null
          product_name?: string
          quantity?: number
          store_order_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "store_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "store_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_order_items_store_order_id_fkey"
            columns: ["store_order_id"]
            isOneToOne: false
            referencedRelation: "store_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string
          customer_id: string
          delivery_address_id: string | null
          delivery_fee: number | null
          id: string
          notes: string | null
          order_number: string
          payment_status: string | null
          prescription_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          subtotal: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_address_id?: string | null
          delivery_fee?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string | null
          prescription_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_address_id?: string | null
          delivery_fee?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string | null
          prescription_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id?: string
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "medical_store_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          commission_override: number | null
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_free_trial: boolean
          max_listings: number | null
          max_users: number | null
          module: string
          modules_included: string[] | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          sort_order: number | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          commission_override?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_free_trial?: boolean
          max_listings?: number | null
          max_users?: number | null
          module: string
          modules_included?: string[] | null
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          commission_override?: number | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_free_trial?: boolean
          max_listings?: number | null
          max_users?: number | null
          module?: string
          modules_included?: string[] | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_trial: boolean
          plan_id: string
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_trial?: boolean
          plan_id: string
          started_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_trial?: boolean
          plan_id?: string
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          brand_name: string | null
          branding: Json | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          domain_slug: string | null
          feature_config: Json | null
          gst_number: string | null
          id: string
          lat: number | null
          lng: number | null
          logo_url: string | null
          modules_enabled: Json | null
          name: string
          owner_user_id: string | null
          pincode: string | null
          registration_number: string | null
          state: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          brand_name?: string | null
          branding?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain_slug?: string | null
          feature_config?: Json | null
          gst_number?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          modules_enabled?: Json | null
          name: string
          owner_user_id?: string | null
          pincode?: string | null
          registration_number?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          type: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          brand_name?: string | null
          branding?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          domain_slug?: string | null
          feature_config?: Json | null
          gst_number?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          modules_enabled?: Json | null
          name?: string
          owner_user_id?: string | null
          pincode?: string | null
          registration_number?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals_logs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          booking_id: string
          id: string
          notes: string | null
          oxygen_saturation: number | null
          patient_profile_id: string | null
          provider_id: string
          pulse_rate: number | null
          recorded_at: string
          temperature: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          booking_id: string
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_profile_id?: string | null
          provider_id: string
          pulse_rate?: number | null
          recorded_at?: string
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          booking_id?: string
          id?: string
          notes?: string | null
          oxygen_saturation?: number | null
          patient_profile_id?: string | null
          provider_id?: string
          pulse_rate?: number | null
          recorded_at?: string
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_logs_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_manager"
        | "verification_officer"
        | "finance_admin"
        | "support_agent"
        | "content_manager"
        | "patient"
        | "agency_admin"
        | "agency_ops"
        | "agency_booking"
        | "agency_support"
        | "agency_recruiter"
        | "agency_finance"
        | "provider"
        | "vendor_admin"
        | "vendor_catalogue"
        | "vendor_inventory"
        | "vendor_orders"
        | "vendor_finance"
        | "store_admin"
        | "store_counter"
        | "store_inventory"
        | "store_dispatch"
        | "hospital_admin"
        | "hospital_procurement"
        | "hospital_discharge"
        | "hospital_nursing"
      booking_status:
        | "pending"
        | "confirmed"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      gender_type: "male" | "female" | "other"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "returned"
        | "disputed"
      provider_type:
        | "home_nurse"
        | "specialized_nurse"
        | "caregiver"
        | "baby_care"
        | "companion"
        | "bystander"
        | "domestic_helper"
      tenant_status: "pending" | "active" | "suspended" | "deactivated"
      tenant_type: "agency" | "vendor" | "medical_store" | "hospital"
      verification_status: "pending" | "under_review" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin_manager",
        "verification_officer",
        "finance_admin",
        "support_agent",
        "content_manager",
        "patient",
        "agency_admin",
        "agency_ops",
        "agency_booking",
        "agency_support",
        "agency_recruiter",
        "agency_finance",
        "provider",
        "vendor_admin",
        "vendor_catalogue",
        "vendor_inventory",
        "vendor_orders",
        "vendor_finance",
        "store_admin",
        "store_counter",
        "store_inventory",
        "store_dispatch",
        "hospital_admin",
        "hospital_procurement",
        "hospital_discharge",
        "hospital_nursing",
      ],
      booking_status: [
        "pending",
        "confirmed",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      gender_type: ["male", "female", "other"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
        "disputed",
      ],
      provider_type: [
        "home_nurse",
        "specialized_nurse",
        "caregiver",
        "baby_care",
        "companion",
        "bystander",
        "domestic_helper",
      ],
      tenant_status: ["pending", "active", "suspended", "deactivated"],
      tenant_type: ["agency", "vendor", "medical_store", "hospital"],
      verification_status: ["pending", "under_review", "approved", "rejected"],
    },
  },
} as const
