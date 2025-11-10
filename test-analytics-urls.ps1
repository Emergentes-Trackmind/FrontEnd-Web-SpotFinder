# 🔧 Test URLs Analytics - Debug Script

echo "=== VERIFICANDO URLs DE ANALYTICS ==="
echo ""

echo "🔧 Configuración Actual:"
echo "  apiBase: http://localhost:3001/api"
echo "  analytics.base: /analytics"
echo "  Resultado esperado: http://localhost:3001/api/analytics/totals"
echo ""

echo "❌ Error anterior:"
echo "  Se generaba: http://localhost:3001/api/api/analytics/totals (doble /api)"
echo ""

echo "✅ Corrección aplicada:"
echo "  1. analytics.api.ts ahora concatena: apiBase + analytics.base"
echo "  2. environment.analytics.base = '/analytics' (sin /api)"
echo "  3. URL final: http://localhost:3001/api + /analytics = http://localhost:3001/api/analytics"
echo ""

echo "🧪 URLs que se deberían generar ahora:"
echo "  - GET http://localhost:3001/api/analytics/totals"
echo "  - GET http://localhost:3001/api/analytics/revenue"
echo "  - GET http://localhost:3001/api/analytics/occupancy"
echo "  - GET http://localhost:3001/api/analytics/activity"
echo "  - GET http://localhost:3001/api/analytics/top-parkings"
echo ""

echo "🔍 Pasos para verificar:"
echo "  1. npm run dev"
echo "  2. Login en http://localhost:4200"
echo "  3. Ir al dashboard"
echo "  4. Abrir DevTools > Network"
echo "  5. Verificar que las URLs no tengan doble /api"
echo ""

echo "⚠️ Si persisten errores 404, verificar:"
echo "  - Que el servidor JSON esté corriendo en puerto 3001"
echo "  - Que las rutas en server/routes.json estén correctas"
echo "  - Que el middleware tenga los endpoints de analytics"
echo ""
