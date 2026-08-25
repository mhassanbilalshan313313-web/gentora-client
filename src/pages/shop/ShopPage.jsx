import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RotateCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import QuickViewModal from '../../components/QuickViewModal';
import API from '../../api/axios';

const ShopPage = ({ isSalePage }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug } = useParams();

  // Filter States initialized from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isSale, setIsSale] = useState(isSalePage || searchParams.get('isSale') === 'true');
  const [isNewArrival, setIsNewArrival] = useState(searchParams.get('isNewArrival') === 'true');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync state changes whenever URL searchParams, categorySlug, or isSalePage prop changes
  useEffect(() => {
    const activeCat = categorySlug || searchParams.get('category') || '';
    const activeSale = isSalePage || searchParams.get('isSale') === 'true';
    const activeNew = searchParams.get('isNewArrival') === 'true';
    const activeSearch = searchParams.get('search') || '';
    const activeMin = searchParams.get('minPrice') || '';
    const activeMax = searchParams.get('maxPrice') || '';
    const activeStock = searchParams.get('inStock') === 'true';
    const activeSort = searchParams.get('sort') || 'newest';
    const activePage = parseInt(searchParams.get('page')) || 1;

    setSelectedCategory(activeCat);
    setIsSale(activeSale);
    setIsNewArrival(activeNew);
    setSearchQuery(activeSearch);
    setMinPrice(activeMin);
    setMaxPrice(activeMax);
    setInStockOnly(activeStock);
    setSortOption(activeSort);
    setPage(activePage);
  }, [searchParams, categorySlug, isSalePage]);

  // Load Categories list
  useEffect(() => {
    API.get('/categories')
      .then((res) => {
        if (res.success) setCategories(res.data || []);
      })
      .catch(() => {});
  }, []);

  // Fetch product catalog whenever active filter states change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (isSale) params.set('isSale', 'true');
        if (isNewArrival) params.set('isNewArrival', 'true');
        if (inStockOnly) params.set('inStock', 'true');
        if (sortOption) params.set('sort', sortOption);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await API.get(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data.products || []);
          setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
        }
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchQuery, selectedCategory, minPrice, maxPrice, isSale, isNewArrival, inStockOnly, sortOption, page]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setIsSale(false);
    setIsNewArrival(false);
    setInStockOnly(false);
    setSortOption('newest');
    setPage(1);
    setSearchParams({});
  };

  const getPageHeading = () => {
    if (isSale || selectedCategory === 'sale') return 'Sale / 50% OFF Collection';
    if (selectedCategory === 'unstitched') return 'Unstitched Suit Fabrics';
    if (selectedCategory === 'shalwar-kameez') return 'Shalwar Kameez Suits';
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      return cat ? cat.name : 'Product Catalog';
    }
    if (isNewArrival) return 'New Arrivals 2026';
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    return 'Shop All Products';
  };

  const getPageDescription = () => {
    if (isSale || selectedCategory === 'sale') return 'Exclusive discounted luxury suit fabrics and Shalwar Kameez up to 50% OFF.';
    if (selectedCategory === 'unstitched') return 'Explore Gentora’s 4.25 meter premium unstitched suit fabrics for custom tailoring.';
    if (selectedCategory === 'shalwar-kameez') return 'Explore Gentora’s luxury Pakistani men’s Shalwar Kameez suits.';
    return 'Explore Gentora’s full range of luxury unstitched suit fabrics and Shalwar Kameez.';
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="font-serif text-3xl lg:text-4xl font-extrabold text-slate-900">
          {getPageHeading()}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {getPageDescription()}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block w-64 space-y-6 flex-shrink-0">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-gentora-emerald" /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                    !selectedCategory ? 'bg-gentora-emerald text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition ${
                      selectedCategory === cat.slug
                        ? 'bg-gentora-emerald text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Price Range (Rs.)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg outline-none focus:border-gentora-emerald"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full text-xs px-2.5 py-1.5 border rounded-lg outline-none focus:border-gentora-emerald"
                />
              </div>
            </div>

            {/* Quick Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isSale}
                  onChange={(e) => { setIsSale(e.target.checked); setPage(1); }}
                  className="accent-gentora-emerald rounded"
                />
                <span>Sale / Discounted Items</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => { setIsNewArrival(e.target.checked); setPage(1); }}
                  className="accent-gentora-emerald rounded"
                />
                <span>New Arrivals 2026</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  className="accent-gentora-emerald rounded"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* CATALOG MAIN CONTENT AREA */}
        <main className="flex-1 space-y-6">
          {/* Top Bar (Search, Mobile Filter Toggle, Sort Dropdown) */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg outline-none focus:border-gentora-emerald"
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className="lg:hidden px-3.5 py-2 border rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-gentora-emerald" /> Filters
              </button>

              {/* Sorting Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
                  className="text-xs font-semibold text-slate-800 border rounded-lg px-3 py-1.5 outline-none focus:border-gentora-emerald bg-white"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-xl animate-shimmer" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-4">
              <p className="text-base font-bold text-slate-800">No products found matching your filters.</p>
              <p className="text-xs text-slate-500">Try adjusting your price range or clearing category selections.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gentora-emerald text-white text-xs font-bold rounded-lg shadow"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg disabled:opacity-40 text-slate-700 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    page === p ? 'bg-gentora-emerald text-white' : 'border text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="p-2 border rounded-lg disabled:opacity-40 text-slate-700 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER DRAWER OVERLAY */}
      {filterDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gentora-emerald" /> Filters
                </span>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => { setSelectedCategory(''); setPage(1); setFilterDrawerOpen(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition ${
                      !selectedCategory ? 'bg-gentora-emerald text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat.slug); setPage(1); setFilterDrawerOpen(false); }}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg transition ${
                        selectedCategory === cat.slug
                          ? 'bg-gentora-emerald text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Price Range (Rs.)</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-gentora-emerald"
                  />
                </div>
              </div>

              {/* Quick Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isSale}
                    onChange={(e) => { setIsSale(e.target.checked); setPage(1); }}
                    className="accent-gentora-emerald rounded"
                  />
                  <span>Sale / Discounted Items</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => { setIsNewArrival(e.target.checked); setPage(1); }}
                    className="accent-gentora-emerald rounded"
                  />
                  <span>New Arrivals 2026</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                    className="accent-gentora-emerald rounded"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-3 bg-gentora-emerald text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { resetFilters(); setFilterDrawerOpen(false); }}
                className="w-full py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
};

export default ShopPage;
