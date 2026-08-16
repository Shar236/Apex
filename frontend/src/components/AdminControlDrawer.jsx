import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { X, Settings, Check, ToggleLeft, ToggleRight, Sparkles, RefreshCw } from 'lucide-react';

export const AdminControlDrawer = () => {
  const { isAdminOpen, setIsAdminOpen, products, toggleProductStock, showToast } = useVoucher();

  if (!isAdminOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-l border-gray-200 p-6 shadow-2xl overflow-y-auto h-full text-gray-900 flex flex-col justify-between">
        
        <div>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-600" />
              <h3 className="font-heading font-extrabold text-lg text-gray-900">
                Apex Admin Demo Panel
              </h3>
            </div>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Toggle product stock states live to test out-of-stock ribbons, disabled CTAs, and inventory overrides.
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Inventory & Stock Controls</h4>
            
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex items-center justify-between gap-3"
              >
                <div>
                  <h5 className="font-bold text-xs text-gray-900">{product.name}</h5>
                  <span className="text-[10px] text-gray-500 font-mono">ID: {product.id}</span>
                </div>

                <button
                  onClick={() => {
                    toggleProductStock(product.id);
                    showToast(`Toggled stock state for ${product.name}`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    product.inStock
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {product.inStock ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={() => setIsAdminOpen(false)}
            className="w-full py-3 rounded-xl premium-gradient hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-violet-200"
          >
            Close Control Panel
          </button>
        </div>

      </div>
    </div>
  );
};
