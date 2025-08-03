#!/bin/bash

SUPABASE_URL="https://qgouamzshrtnkwyzwafq.supabase.co"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnb3VhbXpzaHJ0bmt3eXp3YWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjE5NzQsImV4cCI6MjA2OTczNzk3NH0.v_cz35HhxBn2yEJV5PTdcO78-pw3YC3zaNkXI3kSoAE"

# Test data arrays - all using your email
names=("John Smith" "Sarah Johnson" "Mike Davis" "Emily Wilson" "David Brown" "Lisa Anderson" "James Taylor" "Maria Garcia" "Robert Martinez" "Jennifer Lee" "William Rodriguez" "Amanda White" "Christopher Thompson" "Jessica Moore" "Daniel Jackson" "Ashley Martin" "Matthew Lee" "Nicole Clark" "Joshua Lewis" "Stephanie Hall")

products=("PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20" "GFH-12" "PKI-20" "PKA-20")

quantities=(2 1 3 1 2 1 3 2 1 2 1 3 2 1 2 3 1 2 1 3)

unit_prices=(17000 20000 10000 17000 20000 10000 17000 20000 10000 17000 20000 10000 17000 20000 10000 17000 20000 10000 17000 20000)

statuses=("pending" "approved" "pending" "rejected" "pending" "approved" "pending" "rejected" "pending" "approved" "pending" "rejected" "pending" "approved" "pending" "rejected" "pending" "approved" "pending" "rejected")

for i in {0..19}; do
    name="${names[$i]}"
    email="siddhantgupta385@gmail.com"
    product="${products[$i]}"
    quantity="${quantities[$i]}"
    unit_price="${unit_prices[$i]}"
    total_price=$((quantity * unit_price))
    status="${statuses[$i]}"
    
    echo "Creating entry $((i+1)): $name ($email) - $product x $quantity"
    
    curl -X POST "$SUPABASE_URL/rest/v1/inventory_requests" \
      -H "apikey: $API_KEY" \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d "{\"user_name\":\"$name\",\"user_email\":\"$email\",\"items\":[{\"product_name\":\"$product\",\"quantity\":$quantity,\"unit_price\":$unit_price,\"total_price\":$total_price}],\"total_amount\":$total_price,\"status\":\"$status\",\"admin_notes\":\"Test entry $((i+1)) - $status status\"}"
    
    echo ""
    sleep 0.5
done

echo "✅ Created 20 test inventory entries with your email!"
