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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      carbon_emissions: {
        Row: {
          co2_kg: number
          distance_km: number
          id: string
          mode: string
          offset_kg: number | null
          recorded_at: string
          shipment_id: string | null
        }
        Insert: {
          co2_kg?: number
          distance_km?: number
          id?: string
          mode: string
          offset_kg?: number | null
          recorded_at?: string
          shipment_id?: string | null
        }
        Update: {
          co2_kg?: number
          distance_km?: number
          id?: string
          mode?: string
          offset_kg?: number | null
          recorded_at?: string
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carbon_emissions_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          company_name: string
          created_at: string
          dob: string | null
          email: string
          full_name: string
          id: string
          industry_type: string
          mobile: string
          requirement_description: string
          status: string
          tax_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          dob?: string | null
          email: string
          full_name: string
          id?: string
          industry_type: string
          mobile: string
          requirement_description: string
          status?: string
          tax_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          dob?: string | null
          email?: string
          full_name?: string
          id?: string
          industry_type?: string
          mobile?: string
          requirement_description?: string
          status?: string
          tax_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cold_chain_readings: {
        Row: {
          humidity_pct: number | null
          id: string
          recorded_at: string
          shipment_id: string | null
          temperature_c: number
          threshold_breach: boolean
        }
        Insert: {
          humidity_pct?: number | null
          id?: string
          recorded_at?: string
          shipment_id?: string | null
          temperature_c: number
          threshold_breach?: boolean
        }
        Update: {
          humidity_pct?: number | null
          id?: string
          recorded_at?: string
          shipment_id?: string | null
          temperature_c?: number
          threshold_breach?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cold_chain_readings_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_events: {
        Row: {
          created_at: string
          description: string | null
          entity: string
          event_type: string
          id: string
          severity: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity: string
          event_type: string
          id?: string
          severity?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entity?: string
          event_type?: string
          id?: string
          severity?: string
        }
        Relationships: []
      }
      crossdock_operations: {
        Row: {
          created_at: string
          dock_id: string
          id: string
          inbound_shipment: string
          outbound_shipment: string
          scheduled_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          dock_id: string
          id?: string
          inbound_shipment: string
          outbound_shipment: string
          scheduled_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          dock_id?: string
          id?: string
          inbound_shipment?: string
          outbound_shipment?: string
          scheduled_at?: string | null
          status?: string
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          base_currency: string
          id: string
          quote_currency: string
          rate: number
          updated_at: string
        }
        Insert: {
          base_currency?: string
          id?: string
          quote_currency: string
          rate: number
          updated_at?: string
        }
        Update: {
          base_currency?: string
          id?: string
          quote_currency?: string
          rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      customs_declarations: {
        Row: {
          created_at: string
          declared_value: number | null
          destination_country: string | null
          duty: number | null
          hs_code: string
          id: string
          origin_country: string | null
          shipment_ref: string
          status: string
        }
        Insert: {
          created_at?: string
          declared_value?: number | null
          destination_country?: string | null
          duty?: number | null
          hs_code: string
          id?: string
          origin_country?: string | null
          shipment_ref: string
          status?: string
        }
        Update: {
          created_at?: string
          declared_value?: number | null
          destination_country?: string | null
          duty?: number | null
          hs_code?: string
          id?: string
          origin_country?: string | null
          shipment_ref?: string
          status?: string
        }
        Relationships: []
      }
      demand_forecasts: {
        Row: {
          confidence: number
          created_at: string
          forecast_period: string
          id: string
          predicted_units: number
          region: string
          sku: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          forecast_period: string
          id?: string
          predicted_units?: number
          region: string
          sku: string
        }
        Update: {
          confidence?: number
          created_at?: string
          forecast_period?: string
          id?: string
          predicted_units?: number
          region?: string
          sku?: string
        }
        Relationships: []
      }
      driver_events: {
        Row: {
          driver_name: string
          event_type: string
          id: string
          notes: string | null
          occurred_at: string
          severity: string
          vehicle_id: string | null
        }
        Insert: {
          driver_name: string
          event_type: string
          id?: string
          notes?: string | null
          occurred_at?: string
          severity?: string
          vehicle_id?: string | null
        }
        Update: {
          driver_name?: string
          event_type?: string
          id?: string
          notes?: string | null
          occurred_at?: string
          severity?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      edi_messages: {
        Row: {
          created_at: string
          direction: string
          doc_type: string
          id: string
          partner: string
          payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          direction: string
          doc_type: string
          id?: string
          partner: string
          payload?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          direction?: string
          doc_type?: string
          id?: string
          partner?: string
          payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      fleet_vehicles: {
        Row: {
          created_at: string
          driver_name: string | null
          fuel_pct: number
          health_score: number
          id: string
          last_service_at: string | null
          model: string | null
          next_service_due: string | null
          plate_number: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          driver_name?: string | null
          fuel_pct?: number
          health_score?: number
          id?: string
          last_service_at?: string | null
          model?: string | null
          next_service_due?: string | null
          plate_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          driver_name?: string | null
          fuel_pct?: number
          health_score?: number
          id?: string
          last_service_at?: string | null
          model?: string | null
          next_service_due?: string | null
          plate_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gps_tracks: {
        Row: {
          heading: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          shipment_id: string | null
          speed_kph: number | null
          vehicle_id: string | null
        }
        Insert: {
          heading?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          shipment_id?: string | null
          speed_kph?: number | null
          vehicle_id?: string | null
        }
        Update: {
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          shipment_id?: string | null
          speed_kph?: number | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_tracks_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_tracks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          quantity: number
          reorder_level: number
          sku: string
          unit_price: number
          updated_at: string
          warehouse: string
        }
        Insert: {
          id?: string
          name: string
          quantity?: number
          reorder_level?: number
          sku: string
          unit_price?: number
          updated_at?: string
          warehouse: string
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          reorder_level?: number
          sku?: string
          unit_price?: number
          updated_at?: string
          warehouse?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          gst_rate: number
          hsn_sac: string | null
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          gst_rate?: number
          hsn_sac?: string | null
          id?: string
          invoice_id: string
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          gst_rate?: number
          hsn_sac?: string | null
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cgst: number
          client_address: string | null
          client_gstin: string | null
          client_id: string | null
          client_name: string
          created_at: string
          created_by: string | null
          currency: string
          due_date: string | null
          id: string
          igst: number
          invoice_number: string
          is_interstate: boolean
          issued_at: string
          notes: string | null
          place_of_supply: string
          seller_address: string
          seller_gstin: string
          seller_name: string
          sgst: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          cgst?: number
          client_address?: string | null
          client_gstin?: string | null
          client_id?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          igst?: number
          invoice_number: string
          is_interstate?: boolean
          issued_at?: string
          notes?: string | null
          place_of_supply?: string
          seller_address?: string
          seller_gstin?: string
          seller_name?: string
          sgst?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          cgst?: number
          client_address?: string | null
          client_gstin?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          due_date?: string | null
          id?: string
          igst?: number
          invoice_number?: string
          is_interstate?: boolean
          issued_at?: string
          notes?: string | null
          place_of_supply?: string
          seller_address?: string
          seller_gstin?: string
          seller_name?: string
          sgst?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      iot_sensors: {
        Row: {
          battery_pct: number | null
          device_id: string
          id: string
          last_reading: number | null
          shipment_id: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          battery_pct?: number | null
          device_id: string
          id?: string
          last_reading?: number | null
          shipment_id?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          battery_pct?: number | null
          device_id?: string
          id?: string
          last_reading?: number | null
          shipment_id?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensors_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      last_mile_deliveries: {
        Row: {
          created_at: string
          customer_address: string
          driver_name: string | null
          eta: string | null
          id: string
          status: string
          tracking_number: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          driver_name?: string | null
          eta?: string | null
          id?: string
          status?: string
          tracking_number: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          driver_name?: string | null
          eta?: string | null
          id?: string
          status?: string
          tracking_number?: string
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          id: string
          predicted_failure_date: string | null
          risk_level: string
          status: string
          task: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          predicted_failure_date?: string | null
          risk_level?: string
          status?: string
          task: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          predicted_failure_date?: string | null
          risk_level?: string
          status?: string
          task?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "fleet_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pod_records: {
        Row: {
          delivered_at: string
          id: string
          notes: string | null
          photo_url: string | null
          recipient_name: string
          shipment_id: string | null
          signature_url: string | null
        }
        Insert: {
          delivered_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          recipient_name: string
          shipment_id?: string | null
          signature_url?: string | null
        }
        Update: {
          delivered_at?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          recipient_name?: string
          shipment_id?: string | null
          signature_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pod_records_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      port_status: {
        Row: {
          avg_wait_hours: number | null
          congestion_level: string
          country: string | null
          id: string
          port_name: string
          updated_at: string
          vessels_in_queue: number | null
        }
        Insert: {
          avg_wait_hours?: number | null
          congestion_level?: string
          country?: string | null
          id?: string
          port_name: string
          updated_at?: string
          vessels_in_queue?: number | null
        }
        Update: {
          avg_wait_hours?: number | null
          congestion_level?: string
          country?: string | null
          id?: string
          port_name?: string
          updated_at?: string
          vessels_in_queue?: number | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          base_price: number
          created_at: string
          effective_from: string
          id: string
          lane: string
          rule_name: string
          status: string
          surge_multiplier: number
        }
        Insert: {
          base_price?: number
          created_at?: string
          effective_from?: string
          id?: string
          lane: string
          rule_name: string
          status?: string
          surge_multiplier?: number
        }
        Update: {
          base_price?: number
          created_at?: string
          effective_from?: string
          id?: string
          lane?: string
          rule_name?: string
          status?: string
          surge_multiplier?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      replenishment_orders: {
        Row: {
          created_at: string
          id: string
          recommended_qty: number
          sku: string
          status: string
          warehouse: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommended_qty?: number
          sku: string
          status?: string
          warehouse: string
        }
        Update: {
          created_at?: string
          id?: string
          recommended_qty?: number
          sku?: string
          status?: string
          warehouse?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parameters: Json | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parameters?: Json | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parameters?: Json | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      reverse_logistics: {
        Row: {
          created_at: string
          customer: string
          id: string
          reason: string | null
          refund_amount: number | null
          rma_number: string
          status: string
        }
        Insert: {
          created_at?: string
          customer: string
          id?: string
          reason?: string | null
          refund_amount?: number | null
          rma_number: string
          status?: string
        }
        Update: {
          created_at?: string
          customer?: string
          id?: string
          reason?: string | null
          refund_amount?: number | null
          rma_number?: string
          status?: string
        }
        Relationships: []
      }
      risk_alerts: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          recommended_action: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          recommended_action?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          recommended_action?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      route_optimizations: {
        Row: {
          created_at: string
          destination: string
          distance_km: number | null
          est_time_hours: number | null
          fuel_savings_pct: number | null
          id: string
          origin: string
          recommended_route: string | null
          status: string
        }
        Insert: {
          created_at?: string
          destination: string
          distance_km?: number | null
          est_time_hours?: number | null
          fuel_savings_pct?: number | null
          id?: string
          origin: string
          recommended_route?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          destination?: string
          distance_km?: number | null
          est_time_hours?: number | null
          fuel_savings_pct?: number | null
          id?: string
          origin?: string
          recommended_route?: string | null
          status?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          destination: string
          eta: string | null
          id: string
          mode: string
          origin: string
          status: string
          tracking_number: string
          value_usd: number | null
          vendor_id: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          destination: string
          eta?: string | null
          id?: string
          mode: string
          origin: string
          status?: string
          tracking_number: string
          value_usd?: number | null
          vendor_id?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          destination?: string
          eta?: string | null
          id?: string
          mode?: string
          origin?: string
          status?: string
          tracking_number?: string
          value_usd?: number | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          contract_hash: string | null
          counterparty: string
          created_at: string
          effective_date: string | null
          expiry_date: string | null
          id: string
          status: string
          title: string
          value_usd: number | null
        }
        Insert: {
          contract_hash?: string | null
          counterparty: string
          created_at?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          status?: string
          title: string
          value_usd?: number | null
        }
        Update: {
          contract_hash?: string | null
          counterparty?: string
          created_at?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          status?: string
          title?: string
          value_usd?: number | null
        }
        Relationships: []
      }
      supplier_risk_assessments: {
        Row: {
          created_at: string
          financial_score: number
          geopolitical_score: number
          id: string
          notes: string | null
          operational_score: number
          overall_risk: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          financial_score?: number
          geopolitical_score?: number
          id?: string
          notes?: string | null
          operational_score?: number
          overall_risk?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          financial_score?: number
          geopolitical_score?: number
          id?: string
          notes?: string | null
          operational_score?: number
          overall_risk?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_risk_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assignee: string | null
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_email: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          risk_score: number
          status: string
        }
        Insert: {
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          risk_score?: number
          status?: string
        }
        Update: {
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          risk_score?: number
          status?: string
        }
        Relationships: []
      }
      warehouse_zones: {
        Row: {
          activity_score: number
          density_pct: number
          id: string
          updated_at: string
          warehouse: string
          zone_code: string
        }
        Insert: {
          activity_score?: number
          density_pct?: number
          id?: string
          updated_at?: string
          warehouse: string
          zone_code: string
        }
        Update: {
          activity_score?: number
          density_pct?: number
          id?: string
          updated_at?: string
          warehouse?: string
          zone_code?: string
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "operator"
        | "viewer"
        | "client"
        | "vendor"
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
      app_role: ["admin", "manager", "operator", "viewer", "client", "vendor"],
    },
  },
} as const
