import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "menu": "Menu",
        "my_orders": "My Orders",
        "staff_dashboard": "Staff Dashboard",
        "admin_dashboard": "Admin Dashboard",
        "users": "Users",
        "reports": "Reports",
        "title": "The Coffee Corner",
        "login": "Login",
        "register": "Register",
        "profile": "Profile",
        "sign_out": "Sign out",
        "open_menu": "Open main menu"
      },
      "home": {
        "hero_title": "Discover Your Perfect Coffee",
        "hero_subtitle": "Brewed with passion, served with love.",
        "explore_menu": "Explore Our Menu",
        "specialties_title": "Our Specialties",
        "add_to_cart": "Add to Cart",
        "view_full_menu": "View Full Menu",
        "about_title": "Our Story",
        "about_p1": "Founded in 2023, our coffee shop is dedicated to serving the finest quality coffee in a warm and welcoming environment. We source our beans from sustainable farms around the world and roast them to perfection in-house.",
        "about_p2": "Our baristas are trained to craft each cup with care and precision, ensuring that every sip brings you the rich, complex flavors that coffee lovers crave.",
        "learn_more": "Learn More About Us"
      }
    }
  },
  vi: {
    translation: {
      "nav": {
        "home": "Trang chủ",
        "menu": "Thực đơn",
        "my_orders": "Đơn hàng của tôi",
        "staff_dashboard": "Bảng điều khiển nhân viên",
        "admin_dashboard": "Bảng điều khiển quản trị viên",
        "users": "Người dùng",
        "reports": "Báo cáo",
        "title": "The Coffee Corner",
        "login": "Đăng nhập",
        "register": "Đăng ký",
        "profile": "Hồ sơ",
        "sign_out": "Đăng xuất",
        "open_menu": "Mở menu chính"
      },
      "home": {
        "hero_title": "Khám phá loại cà phê hoàn hảo của bạn",
        "hero_subtitle": "Pha chế bằng đam mê, phục vụ bằng cả trái tim.",
        "explore_menu": "Khám phá thực đơn",
        "specialties_title": "Đặc sản của chúng tôi",
        "add_to_cart": "Thêm vào giỏ hàng",
        "view_full_menu": "Xem toàn bộ thực đơn",
        "about_title": "Câu chuyện của chúng tôi",
        "about_p1": "Được thành lập vào năm 2023, quán cà phê của chúng tôi chuyên phục vụ cà phê chất lượng tốt nhất trong một môi trường ấm áp và thân thiện. Chúng tôi thu mua hạt cà phê từ các trang trại bền vững trên khắp thế giới và rang chúng một cách hoàn hảo tại quán.",
        "about_p2": "Các nhân viên pha chế của chúng tôi được đào tạo để chế biến từng tách cà phê một cách cẩn thận và chính xác, đảm bảo rằng mỗi ngụm cà phê đều mang đến cho bạn hương vị đậm đà, phức hợp mà những người yêu cà phê đều mong muốn.",
        "learn_more": "Tìm hiểu thêm về chúng tôi"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'vi'],
    fallbackLng: 'en',
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;