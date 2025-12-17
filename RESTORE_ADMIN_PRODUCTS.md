# 🔧 QUICK RESTORE: Admin Products After Pull Main

## 🚀 STEP-BY-STEP RESTORE

### 1. Create Upload Directory
```bash
mkdir techmart\backend\uploads\products
echo # > techmart\backend\uploads\products\.gitkeep
```

### 2. Fix API Endpoints in AdminProducts.jsx
Tìm và thay thế tất cả:
```jsx
// ❌ Thay thế từ:
'/api/admin/products'
'/api/admin/upload/image'

// ✅ Thành:
'/admin/products'  
'/admin/upload/image'
```

### 3. Add Image Upload States (AdminProducts.jsx)
Thêm vào đầu component:
```jsx
const [selectedFile, setSelectedFile] = useState(null)
const [imagePreview, setImagePreview] = useState('')
const [uploadingImage, setUploadingImage] = useState(false)
const [imageUploadMethod, setImageUploadMethod] = useState('url')
```

### 4. Add Image Upload Functions (AdminProducts.jsx)
```jsx
const handleImageUpload = async (file) => {
  if (!file) return null
  setUploadingImage(true)
  
  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    
    const response = await api.post('/admin/upload/image', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    return response.data.url
  } catch (error) {
    toast.error('Lỗi khi tải ảnh lên: ' + (error.response?.data?.detail || error.message))
    return null
  } finally {
    setUploadingImage(false)
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }
    
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }
}
```

### 5. Add Image Upload UI (AdminProducts.jsx)
Thêm vào form, sau phần Description:
```jsx
{/* Image Upload/URL */}
<div>
  <label className="block text-sm font-bold text-gray-700 mb-2">Hình Ảnh Sản Phẩm</label>
  
  {/* Method Selection */}
  <div className="flex space-x-4 mb-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="imageMethod"
        value="url"
        checked={imageUploadMethod === 'url'}
        onChange={(e) => setImageUploadMethod(e.target.value)}
        className="w-4 h-4 text-purple-600"
      />
      <span className="text-sm font-medium text-gray-700">Nhập URL</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="imageMethod"
        value="upload"
        checked={imageUploadMethod === 'upload'}
        onChange={(e) => setImageUploadMethod(e.target.value)}
        className="w-4 h-4 text-purple-600"
      />
      <span className="text-sm font-medium text-gray-700">Tải ảnh lên</span>
    </label>
  </div>

  {/* URL Input */}
  {imageUploadMethod === 'url' && (
    <input
      type="url"
      value={formData.images[0]?.url || ''}
      onChange={(e) => {
        setFormData({ 
          ...formData, 
          images: [{ url: e.target.value, is_primary: true, alt_text: formData.name }] 
        })
        setImagePreview(e.target.value)
      }}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
      placeholder="https://example.com/image.jpg"
    />
  )}

  {/* File Upload */}
  {imageUploadMethod === 'upload' && (
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FaImage className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Nhấp để chọn ảnh</span> hoặc kéo thả
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </label>
      </div>
      
      {selectedFile && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">File đã chọn:</span> {selectedFile.name}
        </div>
      )}
    </div>
  )}

  {/* Image Preview */}
  {imagePreview && (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
      <img
        src={imagePreview}
        alt="Preview"
        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
        onError={(e) => {
          e.target.src = '/placeholder.png'
          setImagePreview('')
        }}
      />
    </div>
  )}

  {uploadingImage && (
    <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải ảnh lên...</span>
    </div>
  )}
</div>
```

### 6. Update handleSubmit (AdminProducts.jsx)
Thêm logic upload ảnh vào handleSubmit:
```jsx
// Handle image upload if file is selected
if (imageUploadMethod === 'upload' && selectedFile) {
  console.log('📤 Uploading image...')
  const uploadedImageUrl = await handleImageUpload(selectedFile)
  if (uploadedImageUrl) {
    finalFormData.images = [{ 
      url: uploadedImageUrl, 
      is_primary: true, 
      alt_text: finalFormData.name 
    }]
    console.log('📤 Image uploaded successfully:', uploadedImageUrl)
  } else {
    toast.error('Không thể tải ảnh lên. Vui lòng thử lại.')
    return
  }
}
```

### 7. Add Backend Image Upload Endpoint (admin.py)
```python
@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin)
):
    """Upload image for products"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (max 5MB)
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    try:
        # Create upload directory
        upload_dir = "uploads/products"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Return URL
        image_url = f"http://localhost:8000/uploads/products/{unique_filename}"
        
        try:
            log_activity(current_user["_id"], "IMAGE_UPLOADED", {
                "filename": unique_filename,
                "original_name": file.filename
            })
        except Exception as e:
            print(f"Warning: Could not log activity: {e}")
        
        return {"url": image_url, "filename": unique_filename}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
```

### 8. Fix Login Redirect (Login.jsx)
```jsx
// Navigate based on user role - Admin always goes to /admin
let redirectPath;
if (response.user.role === 'admin') {
  redirectPath = '/admin';
} else {
  redirectPath = location.state?.from || '/';
}

console.log("🔄 User role:", response.user.role);
console.log("🔄 Redirecting to:", redirectPath);
navigate(redirectPath, { replace: true });
```

## ✅ VERIFICATION CHECKLIST

- [ ] Upload directory created
- [ ] API endpoints fixed (no /api prefix)
- [ ] Image upload states added
- [ ] Upload functions implemented
- [ ] UI components added
- [ ] Backend endpoint added
- [ ] Login redirect fixed
- [ ] Test admin login → /admin
- [ ] Test image upload functionality

## 🎯 DONE!
Sau khi hoàn thành các bước trên, chức năng Admin Products với Image Upload sẽ hoạt động hoàn hảo như trước khi pull main!