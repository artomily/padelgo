export interface Database {
  public: {
    Tables: {
      courts: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_per_hour: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price_per_hour: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price_per_hour?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          court_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: "pending" | "confirmed" | "cancelled";
          total_price: number;
          payment_reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: "pending" | "confirmed" | "cancelled";
          total_price: number;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: "pending" | "confirmed" | "cancelled";
          total_price?: number;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      court_blocks: {
        Row: {
          id: string;
          court_id: string;
          block_date: string;
          start_time: string;
          end_time: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          court_id: string;
          block_date: string;
          start_time: string;
          end_time: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          court_id?: string;
          block_date?: string;
          start_time?: string;
          end_time?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled";
    };
  };
}