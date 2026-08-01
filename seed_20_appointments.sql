DO $$
DECLARE
    v_tenant_id uuid;
    v_marcos_id uuid;
    v_lucas_id uuid;
    i integer;
    v_staff_id uuid;
    v_start_time timestamp with time zone;
    v_end_time timestamp with time zone;
    v_status text;
BEGIN
    -- Obtenemos tu negocio (el primer tenant)
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    
    -- Buscamos a los peluqueros (por si acaso tienen algún apellido u otro nombre)
    SELECT id INTO v_marcos_id FROM staff WHERE tenant_id = v_tenant_id AND name ILIKE '%Marcos%' LIMIT 1;
    SELECT id INTO v_lucas_id FROM staff WHERE tenant_id = v_tenant_id AND name ILIKE '%Lucas%' LIMIT 1;

    -- Si no hay negocio, salimos para no romper nada
    IF v_tenant_id IS NULL THEN RETURN; END IF;

    -- Generamos 20 turnos aleatorios para los próximos 7 días
    FOR i IN 1..20 LOOP
        -- Asignamos mitad a Marcos y mitad a Lucas (si los encuentra)
        IF i % 2 = 0 AND v_marcos_id IS NOT NULL THEN
            v_staff_id := v_marcos_id;
        ELSIF v_lucas_id IS NOT NULL THEN
            v_staff_id := v_lucas_id;
        ELSE
            -- Si justo borraste a alguno, asigna a cualquiera que tengas disponible
            SELECT id INTO v_staff_id FROM staff WHERE tenant_id = v_tenant_id LIMIT 1;
        END IF;

        -- Fechas aleatorias (0 a 7 días hacia adelante) y horas (entre las 10:00 y las 19:00)
        v_start_time := CURRENT_DATE + (floor(random() * 8)::int) * interval '1 day' + (10 + floor(random() * 9)::int) * interval '1 hour' + (floor(random() * 2)::int * 30) * interval '1 minute';
        v_end_time := v_start_time + interval '1 hour';
        
        -- Estado aleatorio (la mayoría pendientes, algunos confirmados)
        IF random() > 0.3 THEN
            v_status := 'pending';
        ELSE
            v_status := 'confirmed';
        END IF;

        -- Insertar el turno
        INSERT INTO appointments (
            tenant_id, 
            customer_name, 
            customer_email, 
            customer_phone, 
            staff_id, 
            start_time, 
            end_time, 
            status, 
            total_price, 
            services
        ) VALUES (
            v_tenant_id,
            'Cliente de Prueba ' || i,
            'cliente' || i || '@test.com',
            '+549112233445' || (i % 10),
            v_staff_id,
            v_start_time,
            v_end_time,
            v_status,
            12000 + (floor(random() * 8000)::int), -- precio aleatorio entre 12.000 y 20.000
            '[{"id": "prueba", "name": "Corte de Prueba", "price": 15000, "duration": 60}]'::jsonb
        );
    END LOOP;
END $$;
