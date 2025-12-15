<template>
  <div class="admin-services">
    <div class="section-header">
      <h2>مدیریت خدمات</h2>
      <button @click="openAddDialog" class="btn-add">+ افزودن خدمت</button>
    </div>

    <div v-if="loading" class="loading">در حال بارگذاری...</div>

    <div v-else class="services-table">
      <table>
        <thead>
          <tr>
            <th>شناسه</th>
            <th>عنوان</th>
            <th>آیکون</th>
            <th>قیمت</th>
            <th>ترتیب</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.title }}</td>
            <td><span class="service-icon">{{ service.icon }}</span></td>
            <td>{{ service.price || '-' }}</td>
            <td>{{ service.order }}</td>
            <td>
              <span :class="['status-badge', service.active ? 'active' : 'inactive']">
                {{ service.active ? 'فعال' : 'غیرفعال' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editService(service)" class="btn-edit">ویرایش</button>
              <button @click="deleteService(service.id)" class="btn-delete">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDialog" class="modal-overlay" @click="closeDialog">
          <div class="modal-dialog" @click.stop>
            <h3>{{ editingId ? 'ویرایش خدمت' : 'افزودن خدمت جدید' }}</h3>
            
            <form @submit.prevent="saveService">
              <div class="form-row">
                <div class="form-group">
                  <label for="service-title">عنوان خدمت*</label>
                  <input
                    id="service-title"
                    v-model="formData.title"
                    type="text"
                    required
                    placeholder="مثلاً: طراحی وب"
                  />
                </div>

                <div class="form-group">
                  <label for="service-icon">آیکون</label>
                  <input
                    id="service-icon"
                    v-model="formData.icon"
                    type="text"
                    placeholder="🎯"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="service-description">توضیحات*</label>
                <textarea
                  id="service-description"
                  v-model="formData.description"
                  rows="3"
                  required
                  placeholder="توضیحات کامل خدمت"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="service-color">رنگ</label>
                  <input
                    id="service-color"
                    v-model="formData.color"
                    type="text"
                    placeholder="#667eea"
                  />
                </div>

                <div class="form-group">
                  <label for="service-price">قیمت</label>
                  <input
                    id="service-price"
                    v-model="formData.price"
                    type="text"
                    placeholder="از 10 میلیون تومان"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="service-gradient">گرادیانت (CSS)</label>
                <input
                  id="service-gradient"
                  v-model="formData.gradient"
                  type="text"
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>

              <div class="form-group">
                <label for="service-image">تصویر شاخص</label>
                <div class="image-upload-group">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleImageUpload"
                    :disabled="uploading"
                    class="file-input"
                  />
                  <div v-if="uploading" class="upload-status">در حال آپلود...</div>
                  <div v-if="formData.image" class="image-preview">
                    <img :src="formData.image" alt="پیش‌نمایش" />
                    <button type="button" @click="formData.image = ''" class="btn-remove-image">×</button>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="service-slider">اسلایدر</label>
                <select id="service-slider" v-model.number="formData.slider_id">
                  <option :value="null">بدون اسلایدر</option>
                  <option v-for="slider in sliders" :key="slider.id" :value="slider.id">
                    {{ slider.name }} ({{ slider.images?.length || 0 }} تصویر)
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="service-features">ویژگی‌ها (هر خط یک ویژگی)</label>
                <textarea
                  id="service-features"
                  v-model="featuresText"
                  rows="4"
                  placeholder="طراحی UI/UX حرفه‌ای&#10;ریسپانسیو و موبایل فرندلی&#10;بهینه‌سازی SEO"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="service-order">ترتیب نمایش</label>
                  <input
                    id="service-order"
                    v-model.number="formData.order"
                    type="number"
                    min="0"
                  />
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="formData.active" />
                    <span>فعال</span>
                  </label>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeDialog" class="btn-cancel">
                  انصراف
                </button>
                <button type="submit" class="btn-submit">
                  {{ editingId ? 'بروزرسانی' : 'افزودن' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirmation Dialog -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
          <div class="confirm-dialog" @click.stop>
            <p>آیا از حذف این خدمت اطمینان دارید؟</p>
            <div class="confirm-actions">
              <button @click="showConfirm = false" class="btn-cancel">انصراف</button>
              <button @click="confirmDelete" class="btn-delete">حذف</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../api/services'

const services = ref([])
const sliders = ref([])
const loading = ref(true)
const uploading = ref(false)
const showDialog = ref(false)
const showConfirm = ref(false)
const editingId = ref(null)
const deleteTargetId = ref(null)

const formData = ref({
  title: '',
  description: '',
  icon: '🎯',
  color: '#667eea',
  gradient: '',
  image: '',
  slider_id: null,
  features: [],
  price: '',
  order: 0,
  active: true
})

const featuresText = computed({
  get: () => formData.value.features.join('\n'),
  set: (value) => {
    formData.value.features = value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  }
})

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    icon: '🎯',
    color: '#667eea',
    gradient: '',
    image: '',
    slider_id: null,
    features: [],
    price: '',
    order: 0,
    active: true
  }
}

const openAddDialog = () => {
  editingId.value = null
  resetForm()
  showDialog.value = true
}

const editService = (service) => {
  editingId.value = service.id
  formData.value = {
    title: service.title,
    description: service.description || '',
    icon: service.icon || '🎯',
    color: service.color || '#667eea',
    gradient: service.gradient || '',
    image: service.image || '',
    slider_id: service.slider_id || null,
    features: service.features || [],
    price: service.price || '',
    order: service.order || 0,
    active: service.active !== false
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingId.value = null
  resetForm()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    uploading.value = true
    const uploadedUrl = await adminService.uploadImage(file)
    formData.value.image = uploadedUrl
  } catch (error) {
    console.error('خطا در آپلود تصویر:', error)
    alert('خطا در آپلود تصویر. لطفاً دوباره سعی کنید.')
  } finally {
    uploading.value = false
  }
}

const saveService = async () => {
  try {
    if (editingId.value) {
      await adminService.updateService(editingId.value, formData.value)
    } else {
      await adminService.createService(formData.value)
    }
    
    await fetchServices()
    closeDialog()
  } catch (error) {
    console.error('خطا در ذخیره خدمت:', error)
    alert('خطا در ذخیره خدمت. لطفاً دوباره سعی کنید.')
  }
}

const deleteService = (id) => {
  deleteTargetId.value = id
  showConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await adminService.deleteService(deleteTargetId.value)
    await fetchServices()
    showConfirm.value = false
    deleteTargetId.value = null
  } catch (error) {
    console.error('خطا در حذف خدمت:', error)
    alert('خطا در حذف خدمت. لطفاً دوباره سعی کنید.')
  }
}

const fetchServices = async () => {
  try {
    loading.value = true
    const response = await adminService.getServices()
    services.value = Array.isArray(response) ? response : response.data || []
  } catch (error) {
    console.error('خطا در دریافت خدمات:', error)
    services.value = []
  } finally {
    loading.value = false
  }
}

const fetchSliders = async () => {
  try {
    const response = await adminService.getSliders()
    sliders.value = Array.isArray(response) ? response : response.data || []
  } catch (error) {
    console.error('خطا در دریافت اسلایدرها:', error)
    sliders.value = []
  }
}

onMounted(() => {
  fetchServices()
  fetchSliders()
})
</script>

<style scoped>
.admin-services {
  padding: 2rem;
  max-width: 1400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.125rem;
  color: #666;
}

.services-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: right;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e9ecef;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.service-icon {
  font-size: 1.5rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-edit:hover {
  background: #c7d2fe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-dialog h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1a1a1a;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-top: 2rem;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.image-upload-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-input {
  padding: 0.5rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-input:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
}

.file-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-status {
  padding: 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.image-preview {
  position: relative;
  width: fit-content;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #ddd;
}

.btn-remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: 2px solid white;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-remove-image:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
}

.confirm-dialog p {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-dialog,
.modal-enter-from .confirm-dialog,
.modal-leave-to .modal-dialog,
.modal-leave-to .confirm-dialog {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .services-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
}
</style>
