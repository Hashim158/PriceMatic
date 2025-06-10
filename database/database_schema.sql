-- PriceMatic Database Schema
-- Fixed version with proper constraints and relationships

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequence for items table
CREATE SEQUENCE IF NOT EXISTS items_id_seq;

-- Users table (base table, created first)
CREATE TABLE public.users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    address text,
    phone_number text,
    location text,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    is_active boolean DEFAULT true,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Brands table (referenced by appliances)
CREATE TABLE public.brands (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    logo_image text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT brands_pkey PRIMARY KEY (id)
);

-- Appliances table (main product catalog)
CREATE TABLE public.appliances (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    type text NOT NULL CHECK (type IN ('refrigerator', 'washing_machine', 'air_conditioner', 'microwave', 'dishwasher', 'other')),
    price decimal(10,2) NOT NULL CHECK (price > 0),
    rating decimal(2,1) CHECK (rating >= 1 AND rating <= 5),
    color text,
    capacity text,
    brand_id uuid NOT NULL,
    model_number text UNIQUE NOT NULL,
    brand text NOT NULL,
    images text[], -- Array of image URLs
    features text[], -- Array of feature descriptions
    is_available boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT appliances_pkey PRIMARY KEY (id),
    CONSTRAINT appliances_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE RESTRICT
);

-- Selling table (user listings)
CREATE TABLE public.selling (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    pictures text[], -- Array of image URLs
    brand text NOT NULL,
    price decimal(10,2) NOT NULL CHECK (price > 0),
    description text,
    model_no text,
    color text,
    condition text NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    year_of_purchase integer CHECK (year_of_purchase >= 1990 AND year_of_purchase <= EXTRACT(YEAR FROM CURRENT_DATE)),
    category text NOT NULL CHECK (category IN ('refrigerator', 'washing_machine', 'air_conditioner', 'microwave', 'dishwasher', 'other')),
    is_sold boolean DEFAULT false,
    is_active boolean DEFAULT true,
    CONSTRAINT selling_pkey PRIMARY KEY (id),
    CONSTRAINT selling_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Chat table (messaging system)
CREATE TABLE public.chat (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    sender uuid NOT NULL,
    receiver uuid NOT NULL,
    message text,
    selling_id bigint NOT NULL,
    image text, -- Single image URL for the message
    is_read boolean DEFAULT false,
    CONSTRAINT chat_pkey PRIMARY KEY (id),
    CONSTRAINT chat_selling_id_fkey FOREIGN KEY (selling_id) REFERENCES public.selling(id) ON DELETE CASCADE,
    CONSTRAINT chat_sender_fkey FOREIGN KEY (sender) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT chat_receiver_fkey FOREIGN KEY (receiver) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT chat_different_users CHECK (sender != receiver)
);

-- Review table (product reviews)
CREATE TABLE public.review (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    text text NOT NULL,
    appliance_id bigint NOT NULL,
    title text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewer_name text NOT NULL,
    is_verified boolean DEFAULT false,
    CONSTRAINT review_pkey PRIMARY KEY (id),
    CONSTRAINT review_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT review_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES public.appliances(id) ON DELETE CASCADE,
    CONSTRAINT review_unique_user_appliance UNIQUE (user_id, appliance_id)
);

-- Items table (generic items, if needed for other purposes)
CREATE TABLE public.items (
    id integer NOT NULL DEFAULT nextval('items_id_seq'::regclass),
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT items_pkey PRIMARY KEY (id)
);

-- Specification table (for refrigerators)
CREATE TABLE public.refrigerator_specifications (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    appliance_id bigint NOT NULL,
    net_capacity text,
    freezer_capacity text,
    refrigerator_capacity text,
    voltage text,
    climate_class text,
    net_weight text,
    cooling_technology text,
    refrigerant text,
    number_of_shelves integer,
    material_of_shelves text,
    interior_light boolean DEFAULT false,
    compressor_type text,
    wifi_enabled boolean DEFAULT false,
    height_cm decimal(5,2),
    width_cm decimal(5,2),
    depth_cm decimal(5,2),
    energy_rating text CHECK (energy_rating IN ('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D')),
    CONSTRAINT refrigerator_specifications_pkey PRIMARY KEY (id),
    CONSTRAINT refrigerator_specifications_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES public.appliances(id) ON DELETE CASCADE,
    CONSTRAINT refrigerator_specifications_unique_appliance UNIQUE (appliance_id)
);

-- AC Specifications table (for air conditioners)
CREATE TABLE public.ac_specifications (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    appliance_id bigint NOT NULL,
    cooling_capacity_range text,
    cooling_current_range text,
    rated_current text,
    heating_capacity_range text,
    rated_power_input text,
    energy_efficiency_ratio decimal(3,2),
    power_supply_source text,
    refrigerant text,
    indoor_air_flow_volume text,
    outdoor_noise_level_db integer,
    indoor_net_weight_kg decimal(5,2),
    outdoor_net_weight_kg decimal(5,2),
    indoor_dimensions text, -- Format: "HxWxD in cm"
    outdoor_dimensions text, -- Format: "HxWxD in cm"
    energy_rating text CHECK (energy_rating IN ('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D')),
    CONSTRAINT ac_specifications_pkey PRIMARY KEY (id),
    CONSTRAINT ac_specifications_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES public.appliances(id) ON DELETE CASCADE,
    CONSTRAINT ac_specifications_unique_appliance UNIQUE (appliance_id)
);

-- Washing Machine Specifications table
CREATE TABLE public.washing_machine_specifications (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    appliance_id bigint NOT NULL,
    drum_type text,
    pulsator text,
    motor_type text,
    spin_speed_rpm integer,
    water_level_options text,
    panel_display text,
    body_color text,
    door_type text,
    net_weight_kg decimal(5,2),
    dimensions text, -- Format: "HxWxD in cm"
    -- Features (boolean fields)
    eco_bubble boolean DEFAULT false,
    bubble_storm boolean DEFAULT false,
    speed_spray boolean DEFAULT false,
    dual_storm boolean DEFAULT false,
    air_turbo boolean DEFAULT false,
    auto_restart boolean DEFAULT false,
    child_lock boolean DEFAULT false,
    delay_end boolean DEFAULT false,
    door_lock boolean DEFAULT false,
    intensive_wash boolean DEFAULT false,
    magic_filter boolean DEFAULT false,
    super_speed boolean DEFAULT false,
    smart_check boolean DEFAULT false,
    soft_close_lid boolean DEFAULT false,
    energy_rating text CHECK (energy_rating IN ('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D')),
    CONSTRAINT washing_machine_specifications_pkey PRIMARY KEY (id),
    CONSTRAINT washing_machine_specifications_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES public.appliances(id) ON DELETE CASCADE,
    CONSTRAINT washing_machine_specifications_unique_appliance UNIQUE (appliance_id)
);

-- Create indexes for better performance
CREATE INDEX idx_appliances_type ON public.appliances(type);
CREATE INDEX idx_appliances_brand_id ON public.appliances(brand_id);
CREATE INDEX idx_selling_user_id ON public.selling(user_id);
CREATE INDEX idx_selling_category ON public.selling(category);
CREATE INDEX idx_selling_is_active ON public.selling(is_active);
CREATE INDEX idx_chat_selling_id ON public.chat(selling_id);
CREATE INDEX idx_chat_sender ON public.chat(sender);
CREATE INDEX idx_chat_receiver ON public.chat(receiver);
CREATE INDEX idx_review_appliance_id ON public.review(appliance_id);
CREATE INDEX idx_review_user_id ON public.review(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_appliances_updated_at BEFORE UPDATE ON public.appliances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_selling_updated_at BEFORE UPDATE ON public.selling
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON public.review
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data inserts (optional)
-- Insert sample brand
INSERT INTO public.brands (name, logo_image) VALUES 
('Samsung', 'https://example.com/samsung-logo.png'),
('LG', 'https://example.com/lg-logo.png'),
('Haier', 'https://example.com/haier-logo.png')
ON CONFLICT (name) DO NOTHING;