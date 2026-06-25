
const { errorTypes } = require('../utils/errorHandler');

const validateNIC = (nic) => {
  // NIC validation (supports both 12-digit and 9-digit + V formats)
  const nicRegex = /^(?:\d{12}|\d{9}[vV])$/;
  if (!nicRegex.test(nic)) {
    return {
      isValid: false,
      message: 'NIC must be either 12 digits or 9 digits followed by V (e.g., 200130800629 or 200130800V)'
    };
  }
  return { isValid: true };
};

const validatePhoneNumber = (phone) => {
  const regex = /^0\d{9}$/; // e.g., 0712345678
  if (!regex.test(phone)) {
    return { isValid: false, message: 'Phone number must start with 0 and have 10 digits' };
  }
  return { isValid: true };
};


const validateEmail = (email) => {
  // Email validation (must contain @ and . in domain)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Email must be valid and contain @ and a domain (e.g., example@domain.com)'
    };
  }
  return { isValid: true };
};

const validatePassword = (password) => {
    const errors = [];
    if (!password) {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};


const validateInput = ({ field, value, type, required = true }) => {
  if (required && !value) {
    return { isValid: false, field, message: `${field} is required` };
  }
  if (value && typeof value !== type) {
    return { isValid: false, field, message: `${field} must be a ${type}` };
  }
  return { isValid: true };
};

const validateDinningCartItem = (data, isPartial = false) => {
  const errors = {};

  if (!isPartial || data.item !== undefined) {
    if (!data.item || typeof data.item !== 'string') {
      errors.item = 'Item name is required and must be a string';
    }
  }

  if (!isPartial || data.price !== undefined) {
    if (!data.price || isNaN(data.price)) {
      errors.price = 'Price is required and must be a number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateCustomerDetails = (data) => {
  const errors = {};
  if (!data.nic || !/^\d{12}$/.test(data.nic)) {
    errors.nic = 'NIC is required and must be 12 digits';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// utils/validators.js
const validateReview = (data, isPartial = false) => {
  const errors = {};

  if ((!isPartial || data.customerName !== undefined) &&
    (!data.customerName || typeof data.customerName !== 'string')) {
    errors.customerName = 'Customer name is required and must be a string';
  }

  if ((!isPartial || data.customerEmail !== undefined) &&
    (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail))) {
    errors.customerEmail = 'Valid email is required (e.g., user@example.com)';
  }

  if ((!isPartial || data.reviewText !== undefined) &&
    (!data.reviewText || typeof data.reviewText !== 'string')) {
    errors.reviewText = 'Review text is required';
  }

  if ((!isPartial || data.rating !== undefined) &&
    (!data.rating || isNaN(data.rating) || data.rating < 1 || data.rating > 5)) {
    errors.rating = 'Rating is required and must be a number (1-5)';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};


const validateDinningItem = (data, isPartial = false) => {
  const errors = {};

  if (!isPartial || data.item !== undefined) {
    if (!data.item || typeof data.item !== 'string') {
      errors.item = 'Item name is required and must be a string';
    }
  }

  if (!isPartial || data.price !== undefined) {
    if (!data.price || isNaN(data.price)) {
      errors.price = 'Price is required and must be a number';
    } else if (data.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
  }

  if (!isPartial || data.description !== undefined) {
    if (!data.description || typeof data.description !== 'string') {
      errors.description = 'Description is required';
    }
  }

  if (!isPartial || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string') {
      errors.category = 'Category is required';
    }
  }

  if (!isPartial || data.availability !== undefined) {
    if (!data.availability || typeof data.availability !== 'string') {
      errors.availability = 'Availability status is required';
    }
  }

  if (!isPartial || data.imageUrl !== undefined) {
    if (!data.imageUrl || typeof data.imageUrl !== 'string') {
      errors.imageUrl = 'Image URL is required';
    } else if (!data.imageUrl.startsWith('http')) {
      errors.imageUrl = 'Image URL must be a valid URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const validateRoomRequirements = (requirements) => {
  if (!Array.isArray(requirements) || !requirements.length) {
    throw errorTypes.badRequest('At least one room requirement must be specified');
  }
  requirements.forEach((req, idx) => {
    if (!req.roomNumber) {
      throw errorTypes.badRequest(`Room requirement at index ${idx} is missing 'roomNumber'`);
    }
    if (!req.roomType) {
      throw errorTypes.badRequest(`Room requirement at index ${idx} is missing 'roomType'`);
    }
    if (req.roomPrice == null) {
      throw errorTypes.badRequest(`Room requirement at index ${idx} is missing 'roomPrice'`);
    }
    if (!req.customerType) {
      throw errorTypes.badRequest(`Room requirement at index ${idx} is missing 'customerType'`);
    }
  });
};

const validateCustomerInfo = async (details) => {
  const requiredFields = ['nic', 'name', 'phoneNumber', 'email', 'address'];
  const missingFields = requiredFields.filter(field => !details[field]);
  if (missingFields.length) {
    throw errorTypes.badRequest(`Missing customer details: ${missingFields.join(', ')}`);
  }
  const existingCustomer = await Customer.findOne({
    $or: [
      { nic: details.nic },
      { email: details.email }
    ]
  });
  if (!existingCustomer) {
    throw errorTypes.notFound('No customer found with the provided NIC or email');
  }
};

const validateCustomerForPayments = (customerName, customerNic) => {
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 3) {
    throw errorTypes.badRequest('Customer name must be at least 3 characters long');
  }

  if (!customerNic || typeof customerNic !== 'string') {
    throw errorTypes.badRequest('Customer NIC is required');
  }

  if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(customerNic)) {
    throw errorTypes.badRequest('Invalid NIC format');
  }
};

// Validator functions


module.exports = {
  validateNIC, validatePhoneNumber, validateEmail, validateInput, validateDinningCartItem, validateCustomerDetails,
  validateReview, validateDinningItem, validateCustomerInfo, validateRoomRequirements, validateCustomerForPayments, validatePassword
};