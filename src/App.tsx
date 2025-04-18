import React, { useState, useEffect } from 'react';
import { Printer, Plus, Minus, Send, FileSpreadsheet, GraduationCap, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  userType: 'student' | 'faculty' | 'staff';
  name: string;
  id: string;
  department: string;
  otherDepartment?: string;
  instructorName?: string;
  email: string;
  mobile: string;
  issueDate: string;
  returnDate: string;
  items: Array<{
    name: string;
    quantity: string;
  }>;
}

const departments = [
  'Communication and Computer Engineering',
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Mechanical-Mechatronics Engineering',
  'Physics',
  'Mathematics',
  'Humanities and Social Sciences',
  'Others'
] as const;

function App() {
  const [formData, setFormData] = useState<FormData>({
    userType: 'student',
    name: '',
    id: '',
    department: '',
    otherDepartment: '',
    instructorName: '',
    email: '',
    mobile: '',
    issueDate: '',
    returnDate: '',
    items: [{ name: '', quantity: '' }]
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printData, setPrintData] = useState<FormData | null>(null);
  const [itemsList, setItemsList] = useState<string[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS59bwEmTUVL04181VI7-4W5vWztF5PXZ3xqCH-kT2SWYPbtM_F0_P5YkLvAAx0y7QqOm0beHw_qN4n/pub?output=csv');
      const text = await response.text();
      const rows = text.split('\n').map(row => row.trim());
      const items = rows.slice(1)
        .map(row => row.split(',')[0].trim())
        .filter(Boolean);
      setItemsList(items);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'department' && value !== 'Others' && { otherDepartment: '' }),
      ...(name === 'userType' && (value === 'faculty' || value === 'staff') && { instructorName: '' })
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: '' }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleNewItemSubmit = (index: number) => {
    if (newItemName.trim()) {
      setItemsList(prev => [...prev, newItemName.trim()]);
      handleItemChange(index, 'name', newItemName.trim());
      setNewItemName('');
    }
  };

  const validateForm = () => {
    if (!formData.email.endsWith('@lnmiit.ac.in')) {
      setError('Email must be a valid LNMIIT email address (@lnmiit.ac.in)');
      return false;
    }
    
    if (!formData.mobile.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbxlvyOMnSFpx8o7MWootzm20kBjC9OtsF8k9a_reAF9UZzd1u3t1TJ6ZOWDp8LZrK-wkg/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          department: formData.department === 'Others' ? formData.otherDepartment : formData.department
        }),
      });
      
      setPrintData({ ...formData });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({
      userType: 'student',
      name: '',
      id: '',
      department: '',
      otherDepartment: '',
      instructorName: '',
      email: '',
      mobile: '',
      issueDate: '',
      returnDate: '',
      items: [{ name: '', quantity: '' }]
    });
  };

  const displayData = printData || formData;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 print:bg-white print:h-auto">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm print:shadow-none py-2"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </motion.div>
              <div className="ml-3">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">The LNM Institute of Information Technology</h1>
                <p className="text-xs text-gray-500">Computer Science & Engineering</p>
              </div>
            </div>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src="https://raw.githubusercontent.com/theshivammaheshwari/forms/main/LNMIIT.png"
              alt="LNMIIT Logo"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl shadow-md rounded-lg p-3 sm:p-4"
        >
          <motion.div 
            className="text-center mb-3 sm:mb-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 print:text-black">
              Item Issue Form
            </h2>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  name="userType"
                  value={displayData.userType}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  disabled={submitted}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={displayData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {displayData.userType === 'student' ? 'Roll No' : 'Employee No'}
                </label>
                <input
                  type="text"
                  name="id"
                  value={displayData.id}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={displayData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {formData.department === 'Others' && (
                  <input
                    type="text"
                    name="otherDepartment"
                    value={displayData.otherDepartment}
                    onChange={handleInputChange}
                    placeholder="Please specify department"
                    className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300 mt-2"
                    required
                    disabled={submitted}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={displayData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={displayData.email}
                  onChange={handleInputChange}
                  placeholder="username@lnmiit.ac.in"
                  pattern=".+@lnmiit\.ac\.in$"
                  title="Please enter a valid LNMIIT email address"
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {formData.userType === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={displayData.instructorName}
                    onChange={handleInputChange}
                    placeholder="Enter instructor's name"
                    className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                    disabled={submitted}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={displayData.issueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={displayData.returnDate}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                  required
                  disabled={submitted}
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left text-xs font-medium text-gray-500">S.No</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500">Item Name</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th className="p-2 text-left text-xs font-medium text-gray-500 print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {displayData.items.map((item, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200"
                      >
                        <td className="p-2 text-sm">{index + 1}</td>
                        <td className="p-2">
                          <div className="relative">
                            <select
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                              required
                              disabled={submitted}
                            >
                              <option value="">Select Item</option>
                              {itemsList.map((itemName) => (
                                <option key={itemName} value={itemName}>
                                  {itemName}
                                </option>
                              ))}
                              <option value="other">+ Add New Item</option>
                            </select>
                            {item.name === 'other' && !submitted && (
                              <div className="mt-2 flex gap-2">
                                <input
                                  type="text"
                                  value={newItemName}
                                  onChange={(e) => setNewItemName(e.target.value)}
                                  placeholder="Enter new item name"
                                  className="flex-1 p-2 text-sm border rounded focus:ring-1 focus:ring-purple-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleNewItemSubmit(index)}
                                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                                >
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full p-1 text-sm border rounded"
                            required
                            disabled={submitted}
                            min="1"
                          />
                        </td>
                        <td className="p-2 print:hidden">
                          {!submitted && (
                            <motion.button
                              type="button"
                              onClick={() => removeItem(index)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Minus size={16} />
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {!submitted && (
              <motion.button
                type="button"
                onClick={addItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="print:hidden inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
              >
                <Plus size={16} />
                Add Item
              </motion.button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-4 print:mt-8">
              {displayData.userType === 'student' ? (
                <>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">Student's Signature</p>
                      <p className="text-xs text-gray-500">{displayData.name}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">Instructor's Signature</p>
                      <p className="text-xs text-gray-500">{displayData.instructorName}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">CSE HOD's Signature</p>
                      <p className="text-xs text-gray-500">Dr. Rajbir Kaur</p>
                    </div>
                  </div>
                </>
              ) : displayData.userType === 'faculty' ? (
                <>
                  <div className="text-center col-span-2">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">Faculty's Signature</p>
                      <p className="text-xs text-gray-500">{displayData.name}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">CSE HOD's Signature</p>
                      <p className="text-xs text-gray-500">Dr. Rajbir Kaur</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center col-span-2">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">Staff's Signature</p>
                      <p className="text-xs text-gray-500">{displayData.name}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2">
                      <p className="text-sm font-medium">CSE HOD's Signature</p>
                      <p className="text-xs text-gray-500">Dr. Rajbir Kaur</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!submitted && (
              <div className="flex justify-end print:hidden">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </motion.button>
              </div>
            )}
          </form>
        </motion.div>
      </main>

      <motion.footer 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 text-white py-4 print:hidden mt-auto"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <p className="text-gray-400">
                  Rupa ki Nangal, Post-Sumel, Via, Jamdoli, Jaipur, Rajasthan 302031
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  +91-9468955596
                </p>
                <p className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  smaheshwari@lnmiit.ac.in
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-gray-400">
                <p>Developed by:</p>
                <p className="font-medium text-purple-300">Mr. Shivam Maheshwari</p>
                <p className="text-sm">Technical Superintendent, CSE Department</p>
              </div>
              <p className="text-sm text-gray-500">© {new Date().getFullYear()} The LNM Institute of Information Technology. All rights reserved.</p>
              <a
                href="https://docs.google.com/spreadsheets/d/1V8fviZ4Qhoe_Xe_ml48XMBl3yjVEMouRbMxwZp63WZU/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-purple-300 hover:text-purple-200 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Available Resources
              </a>
            </div>
          </div>
        </div>
      </motion.footer>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
            >
              <motion.div 
                className="flex items-center justify-center mb-4 text-green-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileSpreadsheet size={48} />
              </motion.div>
              <h3 className="text-xl font-semibold text-center text-green-600 mb-3">
                Form Submitted Successfully!
              </h3>
              <p className="text-center mb-6 text-gray-600 text-sm">
                Your form has been submitted. Would you like to print a copy?
              </p>
              <div className="flex justify-center gap-3">
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded hover:bg-gray-100"
                >
                  Close
                </motion.button>
                <motion.button
                  onClick={handlePrint}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                >
                  <Printer size={16} />
                  Print
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;