import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { uploadImageToImgBB, validateImageFile } from '../lib/imgbb';
import type { DestinationType, Priority } from '../types';
import { Save, X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NewDeliveryPage() {
  const { user } = useAuth();
  const { shops, boats, staff, addDelivery, deliveryHistory, updateDeliveryHistory } = useData();
  const navigate = useNavigate();

  // Load saved preferences from localStorage
  const savedPreferences = JSON.parse(localStorage.getItem('deliveryPreferences') || '{}');

  const [formData, setFormData] = useState({
    shopId: user?.permittedShopIds[0] || '',
    billNumber: '',
    destinationType: 'male_shop' as DestinationType,
    destinationName: savedPreferences.destinationName || '',
    boatName: savedPreferences.boatName || '',
    islandName: '',
    islandCode: '',
    contactName: savedPreferences.contactName || '',
    contactNumber: savedPreferences.contactNumber || '',
    deliveryInstructions: '',
    expectedDeliveryAt: '',
    priority: 'medium' as Priority,
    remarks: '',
    staffId: '',
    totalValue: '',
  });
  const [billImage, setBillImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [savePreferences, setSavePreferences] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Upload bill image if provided
      let billImageUrl: string | undefined;
      if (billImage) {
        setIsUploading(true);
        const validation = validateImageFile(billImage);
        if (!validation.valid) {
          setError(validation.error || 'Invalid image file');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
        billImageUrl = await uploadImageToImgBB(billImage);
        setIsUploading(false);
      }

      await addDelivery({
        billNumber: formData.billNumber,
        shopId: formData.shopId,
        destinationType: formData.destinationType,
        destinationName: formData.destinationName || formData.destinationType.replace('_', ' '),
        boatName: formData.boatName || undefined,
        islandName: formData.islandName || undefined,
        islandCode: formData.islandCode || undefined,
        contactName: formData.contactName || undefined,
        contactNumber: formData.contactNumber || undefined,
        deliveryInstructions: formData.deliveryInstructions || undefined,
        expectedDeliveryAt: formData.expectedDeliveryAt ? new Date(formData.expectedDeliveryAt) : undefined,
        priority: formData.priority,
        currentStatus: 'new_entry',
        exceptionFlags: [],
        createdBy: user!.uid,
        updatedBy: user!.uid,
        entryStaffId: formData.staffId || undefined,
        remarks: formData.remarks || undefined,
        attachmentIds: billImageUrl ? [billImageUrl] : [],
        totalValue: formData.totalValue ? parseFloat(formData.totalValue) : undefined,
      });

      // Save preferences if enabled
      if (savePreferences) {
        const preferences = {
          boatName: formData.boatName,
          destinationName: formData.destinationName,
          contactName: formData.contactName,
          contactNumber: formData.contactNumber,
        };
        localStorage.setItem('deliveryPreferences', JSON.stringify(preferences));
      }

      // Save to history for dropdown suggestions
      const history = deliveryHistory || {
        boatNames: [],
        shopNames: [],
        contactNames: [],
        contactNumbers: [],
      };
      const updates: any = {};
      if (formData.boatName) {
        updates.boatNames = [...new Set([...history.boatNames, formData.boatName])].slice(-20);
      }
      if (formData.destinationName) {
        updates.shopNames = [...new Set([...history.shopNames, formData.destinationName])].slice(-20);
      }
      if (formData.contactName) {
        updates.contactNames = [...new Set([...history.contactNames, formData.contactName])].slice(-20);
      }
      if (formData.contactNumber) {
        updates.contactNumbers = [...new Set([...history.contactNumbers, formData.contactNumber])].slice(-20);
      }
      if (Object.keys(updates).length > 0) {
        await updateDeliveryHistory(updates);
      }
      
      // Navigate to Wholesale page
      navigate('/wholesale');
      
      // Reset form
      setFormData({
        shopId: user?.permittedShopIds[0] || '',
        billNumber: '',
        destinationType: 'male_shop',
        destinationName: savePreferences ? formData.destinationName : '',
        boatName: savePreferences ? formData.boatName : '',
        islandName: '',
        islandCode: '',
        contactName: savePreferences ? formData.contactName : '',
        contactNumber: savePreferences ? formData.contactNumber : '',
        deliveryInstructions: '',
        expectedDeliveryAt: '',
        priority: 'medium',
        remarks: '',
        staffId: '',
        totalValue: '',
      });
      setBillImage(null);
    } catch (err) {
      setError('Failed to create delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillImage(e.target.files[0]);
    }
  };

  const userShops = shops; // Show all shops for now since permittedShopIds is not populated
  const wholesaleStaff = staff.filter(s => s.department === 'wholesale' && s.active);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Delivery Entry</h1>
        <p className="text-gray-600">Create a new delivery record</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Required Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wholesale Shop <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.shopId}
              onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select shop</option>
              {userShops.map(shop => (
                <option key={shop.shopId} value={shop.shopId}>
                  {shop.shopName} ({shop.shopCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Staff
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select staff (optional)</option>
              {wholesaleStaff.map(staffMember => (
                <option key={staffMember.staffId} value={staffMember.staffId}>
                  {staffMember.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Bill Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.billNumber}
              onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter bill number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Value (MVR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.totalValue}
              onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter total value in MVR"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.destinationType}
              onChange={(e) => setFormData({ ...formData, destinationType: e.target.value as DestinationType })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male_shop">Shop</option>
              <option value="boat">Boat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Conditional Fields */}
        {formData.destinationType === 'boat' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boat Name
              </label>
              <input
                type="text"
                list="boat-list"
                value={formData.boatName}
                onChange={(e) => setFormData({ ...formData, boatName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter or select boat name"
              />
              <datalist id="boat-list">
                {boats.map(boat => (
                  <option key={boat.boatId} value={boat.boatName}>
                    {boat.boatName}
                  </option>
                ))}
                {(deliveryHistory?.boatNames || []).map((name, index) => (
                  <option key={`history-boat-${index}`} value={name}>
                    {name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

        {formData.destinationType === 'male_shop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                list="shop-list"
                value={formData.destinationName}
                onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter shop name"
              />
              <datalist id="shop-list">
                {(deliveryHistory?.shopNames || []).map((name, index) => (
                  <option key={`history-shop-${index}`} value={name}>
                    {name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              list="contact-name-list"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact name"
            />
            <datalist id="contact-name-list">
              {(deliveryHistory?.contactNames || []).map((name, index) => (
                <option key={`history-contact-name-${index}`} value={name}>
                  {name}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              list="contact-number-list"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact number"
            />
            <datalist id="contact-number-list">
              {(deliveryHistory?.contactNumbers || []).map((number, index) => (
                <option key={`history-contact-number-${index}`} value={number}>
                  {number}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Save Preferences */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="savePreferences"
            checked={savePreferences}
            onChange={(e) => setSavePreferences(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="savePreferences" className="ml-2 block text-sm text-gray-700">
            Save boat name, shop name, and contact details for next delivery
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Delivery Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.expectedDeliveryAt}
            onChange={(e) => setFormData({ ...formData, expectedDeliveryAt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Instructions
          </label>
          <textarea
            value={formData.deliveryInstructions}
            onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any special delivery instructions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any internal notes"
          />
        </div>

        {/* Bill Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bill Image (Optional)
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-2 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
              {billImage && (
                <p className="text-sm text-green-600 font-medium">
                  Selected: {billImage.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Delivery
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
