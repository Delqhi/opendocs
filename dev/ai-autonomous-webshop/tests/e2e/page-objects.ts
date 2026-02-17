import { type Page, type Locator, expect } from '@playwright/test';
import { selectors, config } from './test.config';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'networkidle' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}

export class NavigationPage extends BasePage {
  readonly logo: Locator;
  readonly loginButton: Locator;
  readonly cartButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator(selectors.navigation.logo).first();
    this.loginButton = page.locator(selectors.auth.loginButton);
    this.cartButton = page.locator(selectors.cart.cartButton).first();
    this.searchInput = page.locator(selectors.catalog.searchInput);
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clickCart(): Promise<void> {
    await this.cartButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }
}

export class AuthPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator(selectors.auth.emailInput);
    this.passwordInput = page.locator(selectors.auth.passwordInput);
    this.submitButton = page.locator(selectors.auth.submitButton);
    this.registerLink = page.locator(selectors.auth.registerLink);
    this.errorMessage = page.locator('[class*="error"], [role="alert"]');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForTimeout(1000);
  }

  async loginAsDemo(): Promise<void> {
    await this.login(config.testUsers.admin.email, config.testUsers.admin.password);
  }

  async loginAsStandard(): Promise<void> {
    await this.login(config.testUsers.standard.email, config.testUsers.standard.password);
  }

  async tryLoginWithInvalid(): Promise<void> {
    await this.login(config.testUsers.invalid.email, config.testUsers.invalid.password);
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  async isLoggedIn(): Promise<boolean> {
    const userAvatar = this.page.locator(selectors.auth.userAvatar);
    return await userAvatar.isVisible().catch(() => false);
  }
}

export class CatalogPage extends BasePage {
  readonly featuredProducts: Locator;
  readonly productCards: Locator;
  readonly categoryLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.featuredProducts = page.locator(selectors.catalog.featuredProducts);
    this.productCards = page.locator(selectors.catalog.productCard);
    this.categoryLinks = page.locator(selectors.catalog.categoryLink);
  }

  async waitForProducts(): Promise<void> {
    await this.featuredProducts.waitFor({ state: 'visible' });
  }

  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  async clickFirstProduct(): Promise<void> {
    await this.productCards.first().click();
    await this.page.waitForTimeout(500);
  }

  async clickCategory(categoryName: string): Promise<void> {
    await this.categoryLinks.filter({ hasText: categoryName }).first().click();
    await this.waitForPageLoad();
  }
}

export class ProductDetailPage extends BasePage {
  readonly productDetail: Locator;
  readonly productImage: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly priceElement: Locator;
  readonly productTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.productDetail = page.locator(selectors.product.productDetail);
    this.productImage = page.locator(selectors.product.productImage);
    this.addToCartButton = page.locator(selectors.product.addToCart);
    this.quantityInput = page.locator(selectors.product.quantitySelector);
    this.priceElement = page.locator(selectors.catalog.productPrice).first();
    this.productTitle = page.locator(selectors.catalog.productTitle).first();
  }

  async waitForLoad(): Promise<void> {
    await this.productDetail.waitFor({ state: 'visible' });
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1 && await this.quantityInput.isVisible()) {
      await this.quantityInput.fill(quantity.toString());
    }
    await this.addToCartButton.click();
    await this.page.waitForTimeout(500);
  }

  async getProductInfo(): Promise<{ title: string; price: string }> {
    const title = await this.productTitle.textContent() || '';
    const price = await this.priceElement.textContent() || '';
    return { title, price };
  }
}

export class CartPage extends BasePage {
  readonly cartDrawer: Locator;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly checkoutButton: Locator;
  readonly totalElement: Locator;
  readonly removeButtons: Locator;
  readonly clearCartButton: Locator;
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartDrawer = page.locator(selectors.cart.cartDrawer);
    this.cartItems = page.locator(selectors.cart.cartItem);
    this.emptyCartMessage = page.locator(selectors.cart.emptyCartMessage);
    this.checkoutButton = page.locator(selectors.cart.checkoutButton);
    this.totalElement = page.locator('[class*="total"], [class*="Total"]').first();
    this.removeButtons = page.locator(selectors.cart.removeButton);
    this.clearCartButton = page.locator(selectors.cart.clearCartButton);
    this.couponInput = page.locator(selectors.cart.couponInput);
    this.applyCouponButton = page.locator(selectors.cart.applyCouponButton);
  }

  async openCart(): Promise<void> {
    const cartButton = this.page.locator(selectors.cart.cartButton);
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await this.page.waitForTimeout(500);
    }
  }

  async waitForCartOpen(): Promise<void> {
    await this.cartDrawer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      return this.emptyCartMessage.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async isCartEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible().catch(() => false);
  }

  async removeFirstItem(): Promise<void> {
    if (await this.removeButtons.first().isVisible()) {
      await this.removeButtons.first().click();
      await this.page.waitForTimeout(300);
    }
  }

  async clearCart(): Promise<void> {
    if (await this.clearCartButton.isVisible()) {
      await this.clearCartButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
    await this.page.waitForTimeout(500);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForTimeout(500);
  }

  async getTotal(): Promise<string> {
    if (await this.totalElement.isVisible()) {
      return await this.totalElement.textContent() || '';
    }
    return '';
  }
}

export class CheckoutPage extends BasePage {
  readonly checkoutForm: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipCodeInput: Locator;
  readonly countrySelect: Locator;
  readonly shippingOptions: Locator;
  readonly orderSummary: Locator;
  readonly placeOrderButton: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutForm = page.locator(selectors.checkout.checkoutPage);
    this.firstNameInput = page.locator(selectors.checkout.firstName);
    this.lastNameInput = page.locator(selectors.checkout.lastName);
    this.addressInput = page.locator(selectors.checkout.address);
    this.cityInput = page.locator(selectors.checkout.city);
    this.zipCodeInput = page.locator(selectors.checkout.zipCode);
    this.countrySelect = page.locator(selectors.checkout.country);
    this.shippingOptions = page.locator(selectors.checkout.shippingOptions);
    this.orderSummary = page.locator(selectors.checkout.orderSummary);
    this.placeOrderButton = page.locator(selectors.checkout.placeOrderButton);
    this.emailInput = page.locator(selectors.checkout.checkoutPage).locator('input[type="email"]');
  }

  async waitForLoad(): Promise<void> {
    await this.checkoutForm.waitFor({ state: 'visible', timeout: 5000 });
  }

  async fillShippingInfo(info: {
    email?: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
    country?: string;
  }): Promise<void> {
    if (info.email) {
      await this.emailInput.fill(info.email);
    }
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.addressInput.fill(info.address);
    await this.cityInput.fill(info.city);
    await this.zipCodeInput.fill(info.zipCode);
    if (info.country) {
      await this.countrySelect.fill(info.country);
    }
  }

  async selectShippingOption(option: 'Standard' | 'Express' | 'Priority'): Promise<void> {
    const optionLocator = this.page.locator(`text=${option}`);
    if (await optionLocator.isVisible()) {
      await optionLocator.click();
      await this.page.waitForTimeout(300);
    }
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.page.waitForTimeout(1000);
  }
}

export class OrderConfirmationPage extends BasePage {
  readonly confirmationContainer: Locator;
  readonly orderNumber: Locator;
  readonly continueShoppingButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmationContainer = page.locator(selectors.order.confirmationPage);
    this.orderNumber = page.locator(selectors.order.orderNumber);
    this.continueShoppingButton = page.locator(selectors.order.continueShopping);
    this.successMessage = page.locator('text=Thank you, text=Order confirmed, text=success');
  }

  async waitForConfirmation(): Promise<void> {
    await this.confirmationContainer.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getOrderNumber(): Promise<string> {
    if (await this.orderNumber.isVisible()) {
      return await this.orderNumber.textContent() || '';
    }
    return '';
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.waitForPageLoad();
  }

  async isOrderSuccessful(): Promise<boolean> {
    return await this.successMessage.first().isVisible().catch(() => false);
  }
}

export async function loginUser(page: Page, email?: string, password?: string): Promise<void> {
  const authPage = new AuthPage(page);
  await authPage.goto('/');
  await authPage.clickLogin();
  
  const userEmail = email || config.testUsers.admin.email;
  const userPassword = password || config.testUsers.admin.password;
  await authPage.login(userEmail, userPassword);
  await page.waitForTimeout(1000);
}

export async function addProductToCart(page: Page, quantity: number = 1): Promise<void> {
  const catalogPage = new CatalogPage(page);
  await catalogPage.waitForProducts();
  await catalogPage.clickFirstProduct();
  
  const productPage = new ProductDetailPage(page);
  await productPage.waitForLoad();
  await productPage.addToCart(quantity);
}

export async function completeCheckout(page: Page, shippingInfo: {
  email?: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
}): Promise<void> {
  const cartPage = new CartPage(page);
  await cartPage.openCart();
  await cartPage.waitForCartOpen();
  await cartPage.proceedToCheckout();
  
  const checkoutPage = new CheckoutPage(page);
  await checkoutPage.waitForLoad();
  await checkoutPage.fillShippingInfo(shippingInfo);
  await checkoutPage.placeOrder();
}

export async function runAccessibilityCheck(page: Page): Promise<void> {
  const accessibilityIssues: string[] = [];
  
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const text = await button.textContent();
    const hasAriaLabel = await button.getAttribute('aria-label');
    const hasLabel = await button.locator('label').count();
    if (!text?.trim() && !hasAriaLabel && hasLabel === 0) {
      accessibilityIssues.push('Button without accessible name');
    }
  }
  
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const ariaLabel = await img.getAttribute('aria-label');
    if (!alt && !ariaLabel) {
      accessibilityIssues.push('Image without alt text');
    }
  }
  
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const type = await input.getAttribute('type');
    const ariaLabel = await input.getAttribute('aria-label');
    const label = await input.locator('label').count();
    const placeholder = await input.getAttribute('placeholder');
    if (type !== 'hidden' && !ariaLabel && label === 0 && !placeholder) {
      accessibilityIssues.push('Input without label');
    }
  }
  
  if (accessibilityIssues.length > 0) {
    console.log('Accessibility issues found:', accessibilityIssues);
  }
}
