import { useState } from "react";
import axios from "axios";

// 引入App.jsx
import "./assets/style.css";

// API 設定
// //很重要的重點.env要放在最外層資料夾 ，可以用這行確認有沒有抓到console.log("API_BASE:", API_BASE);
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
//記得改成className
function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);

  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  };

  const getproducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      //測試時候可以用console.log(response.data);，正式時候要拿掉
      const { token, expired } = response.data;
      // 設定 Cookie    hexToken 是可以自己改名字
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common["Authorization"] = token;
      getproducts();
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  const checkLogin = async () => {
    try {
      // 讀取 Cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // 修改實體建立時所指派的預設配置

      axios.defaults.headers.common["Authorization"] = token;

      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };
  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e)}
                required
                autoFocus
              />
              {/* 老師建議Id改成name*/}
              {/*記得要做封閉式*/}
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              {/* 功能按鈕 */}
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={() => checkLogin()}
              >
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        <span
                          className={
                            product.is_enabled ? "text-success" : "text-danger"
                          }
                        >
                          {product.is_enabled ? "啟用" : "未啟用"}
                          {/* 根據 is_enabled 顯示不同文字與顏色 */}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看細節
                        </button>
                        {/* 叫 setTempProduct 將當前的 product 存入狀態 */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {/* 下面是條件式 判斷 tempProduct 是否有值 用?*/}
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    style={{ height: "300px", objectFit: "cover" }}
                    alt={tempProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>

                    {tempProduct.imagesUrl?.map((url, index) => (
                      <img
                        key={index} //  map要加 key
                        className="images me-2 mb-2"
                        src={url}
                        style={{ width: "100px" }} // 固定寬度才不會亂跳
                        alt={`副圖 ${index + 1}`} // AI建議加上動態alt
                      />
                    ))}
                    {/* 外來優化AI建議加上 ?. (Optional Chaining) 防止 imagesUrl 為空時出錯 */}
                  </div>
                </div>
              ) : (
                <p className="text-secondary">尚未點選，請按下查看細節</p>
              )}{" "}
              {/* 如果 tempProduct 是 null (初始狀態)，顯示這行 */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
