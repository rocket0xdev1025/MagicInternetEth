(function ($) {
  const CTCCoupon = {
    /**
     * Init
     */
    init: function () {
      this._bind();
    },

    /**
     * Binds events
     */
    _bind: function () {
      $(document).on("click", ".ctc-coupon-toggle-link", this.toggleDetails);
      $(document).on("click", ".ctc-coupon-link", this.handleClick);
    },

    /**
     * Copy text to clipboard using CTC CopyEngine.
     *
     * @param {string} text Text to copy.
     * @return {Promise<boolean>} Success status.
     */
    copyToClipboard: async function (text) {
      // Method 1: Use CTC CopyEngine.
      if (window.CTC && window.CTC.CopyEngine) {
        try {
          const copyEngine = new window.CTC.CopyEngine();
          const result = await copyEngine.execute({ value: text });
          if (result.success) {
            return true;
          }
        } catch (err) {
          // Fall through to fallbacks.
        }
      }

      // Method 2: Clipboard API.
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          // Fall through.
        }
      }

      // Method 3: execCommand fallback.
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText =
          "position:fixed;opacity:0;pointer-events:none;";
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        return success;
      } catch (err) {
        return false;
      }
    },

    /**
     * Handle click
     */
    handleClick: async function (event) {
      event.preventDefault();

      const self = $(this);
      const parent = self.parents(".ctc-coupon");
      if (parent.hasClass("ctc-coupon-clicked")) {
        return;
      }

      const href = self.attr("href");
      const target = self.attr("target");
      const couponCode = parent.find(".ctc-coupon-code").text().trim() || "";

      parent.addClass("ctc-coupon-clicked");

      await CTCCoupon.copyToClipboard(couponCode);

      window.open(href, target);
    },

    /**
     * Handle click
     */
    oldHandleClick: function (event) {
      event.preventDefault();

      const self = $(this);
      const href = self.data("href");
      const target = self.data("target");
      const btn = self.find(".ctc-coupon-button");

      // Clicked then open the link
      if (!self.hasClass("ctc-coupon-link-clicked")) {
        window.open(href, target);

        self.addClass("ctc-coupon-link-clicked");
        btn.text("Copy Code");
      }

      if (self.hasClass("ctc-coupon-link-clicked")) {
        self.addClass("ctc-coupon-link-copied");
        btn.text("Copied");
      }
    },

    /**
     * Toggle Details
     */
    toggleDetails: function (event) {
      event.preventDefault();

      const self = $(this);
      const coupon = self.parents(".ctc-coupon");
      const details = coupon.find(".ctc-toggle-details");

      details.slideToggle("fast");
    },
  };

  /**
   * Initialization
   */
  $(function () {
    CTCCoupon.init();
  });
})(jQuery);
