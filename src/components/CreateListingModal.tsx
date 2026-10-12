import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  DollarSign,
  HelpCircle,
  Image as ImageIcon,
  Upload,
  Camera,
  Check,
  Star,
} from 'lucide-react';
import { Category, MeetupLocation, ListingCondition } from '../types';
import { api } from '../api';
import { processMultipleImageFiles } from '../utils/imageUpload';

interface CreateListingModalProps {
  categories: Category[];
  meetupLocations: MeetupLocation[];
  onClose: () => void;
  onSuccess: (created: any) => void;
}

const PRESET_IMAGES = [
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80' },
  { name: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80' },
  { name: 'Lab Coat', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80' },
  { name: 'Laptop', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80' },
  { name: 'Dorm Chair', url: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80' },
  { name: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { name: 'College Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
  { name: 'Drafting Kit', url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&auto=format&fit=crop&q=80' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  categories,
  meetupLocations,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('GOOD');
  const [quantity, setQuantity] = useState('1');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [preferredMeetupId, setPreferredMeetupId] = useState(meetupLocations[0]?.id || '');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [itemYear, setItemYear] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Device Photos state
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Prohibited words live check
  const prohibitedWords = ['gun', 'vape', 'drug', 'weed', 'counterfeit', 'exam leak', 'ghostwrite', 'stolen'];
  const hasProhibitedWarning = prohibitedWords.some(
    (w) => title.toLowerCase().includes(w) || description.toLowerCase().includes(w)
  );

  // Handle direct file uploads from device (phone, iPad, desktop)
  const handleDeviceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    setError('');
    try {
      const processed = await processMultipleImageFiles(files);
      if (processed.length > 0) {
        setImages((prev) => [...prev, ...processed]);
      }
    } catch (err: any) {
      setError(err.message || 'Error processing photos from device.');
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleDeviceFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleAddPresetImage = (url: string) => {
    if (images.includes(url)) return;
    setImages((prev) => [...prev, url]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId || !price) {
      setError('Please fill in all required fields (Title, Category, Price, Description).');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Please enter a valid price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const finalImages = images.length > 0 ? images : [PRESET_IMAGES[0].url];

      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        price: numericPrice,
        condition,
        quantity: parseInt(quantity, 10) || 1,
        isNegotiable,
        preferredMeetupId,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        itemYear: itemYear.trim() || undefined,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        images: finalImages,
      };

      const created = await api.createListing(payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              List an Item on Campus Bentahan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload photos directly from your device and set safe meetup spots
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {hasProhibitedWarning && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">Campus Safety Notice</p>
                <p className="mt-0.5">
                  Your listing includes keywords monitored by university rules. It will be reviewed by campus administrators before final confirmation.
                </p>
              </div>
            </div>
          )}

          {/* Section: Direct Device Photo Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Product Photos (Upload from Device) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {images.length} photo{images.length === 1 ? '' : 's'} added
              </span>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleDeviceFiles(e.target.files)}
              className="hidden"
              id="listing-device-file-input"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleDeviceFiles(e.target.files)}
              className="hidden"
              id="listing-device-camera-input"
            />

            {/* Drag and drop / Click upload zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  {isProcessingPhotos ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {isProcessingPhotos ? 'Processing device photos...' : 'Drag & drop photos or select from device'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports camera photos from phones, iPads, and computers (JPEG, PNG, WebP)
                  </p>
                </div>

                {/* Direct action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <label
                    htmlFor="listing-device-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose from Device</span>
                  </label>

                  <label
                    htmlFor="listing-device-camera-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Take Photo</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="inline-flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showPresets ? 'Hide Sample Gear' : 'Sample Campus Gear'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sample Photos Selector (Optional fallback) */}
            {showPresets && (
              <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700 animate-in fade-in duration-150">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Select sample university items:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleAddPresetImage(preset.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                        images.includes(preset.url)
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap thumbnail to set as primary cover photo.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 group bg-slate-100 dark:bg-slate-800 ${
                        idx === 0
                          ? 'border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-950'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Cover Badge */}
                      {idx === 0 ? (
                        <span className="absolute bottom-1 left-1 bg-yellow-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm border border-yellow-500">
                          <Star className="w-2.5 h-2.5 fill-current text-emerald-950" />
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          Make Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm transition"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Casio FX-991EX Scientific Calculator (with case)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.parentGroup}] {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Item Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="NEW">Brand New (Unopened / Tagged)</option>
                <option value="LIKE_NEW">Like New (Mint, No Marks)</option>
                <option value="GOOD">Good (Light Use, Fully Functional)</option>
                <option value="FAIR">Fair (Visible Marks / Usable)</option>
                <option value="POOR">Poor (Heavy Wear / Spares)</option>
              </select>
            </div>
          </div>

          {/* Price, Original Price, Negotiable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Price (₱) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                  ₱
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="650"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Original Price (₱)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="1450"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span>Allow Negotiation</span>
              </label>
            </div>
          </div>

          {/* Preferred Safe Meetup Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Preferred Campus Meetup Spot <span className="text-rose-500">*</span>
            </label>
            <select
              value={preferredMeetupId}
              onChange={(e) => setPreferredMeetupId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              {meetupLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.campusZone})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Mention semester used, functional status, included accessories, reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed"
            />
          </div>

          {/* Optional Specs (Brand, Model, Year) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Optional Item Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Brand (e.g. Casio, Pearson)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
              <input
                type="text"
                placeholder="Model / Edition (e.g. 14th Ed)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
              <input
                type="text"
                placeholder="Year (e.g. 2024)"
                value={itemYear}
                onChange={(e) => setItemYear(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isProcessingPhotos}
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 text-xs sm:text-sm font-black rounded-xl shadow-md border border-yellow-500/60 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
