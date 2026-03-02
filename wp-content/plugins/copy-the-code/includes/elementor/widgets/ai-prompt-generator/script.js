(function ($) {
  const CTCAIPromptGenerator = {
    /**
     * Init
     */
    init: function () {
      this._bind();
      this._generate();
    },

    /**
     * Binds events
     */
    _bind: function () {
      $(document).on("click", ".ctc-ai-generator-button", this.doCopy);
      $(document).on("input", ".ctc-ai-prompt-generator input", this.doChange);
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
     * Do Change
     */
    doChange: function (event) {
      event.preventDefault();

      CTCAIPromptGenerator._generate();
    },

    /**
     * Do Copy to Clipboard
     */
    doCopy: async function (event) {
      event.preventDefault();

      const self = $(this);
      const parent = self.parents(".ctc-ai-prompt-generator");
      const textarea = parent.find(".ctc-ai-prompt-generator-textarea");
      let text = textarea.val() || "";

      // Remove first and last new line.
      text = text.trim();

      // Copy to clipboard using CTC CopyEngine.
      await CTCAIPromptGenerator.copyToClipboard(text);

      // Copied!
      parent.addClass("copied");
      setTimeout(function () {
        parent.removeClass("copied");
      }, 1000);
    },

    /**
     * Generate
     */
    _generate: function () {
      const blocks = $(".ctc-ai-prompt-generator");

      blocks.each(function () {
        const fields = $(this).find(".ctc-block-field");
        const textarea = $(this).find(".ctc-ai-prompt-generator-textarea");
        let markup = "";

        fields.each(function () {
          const label = $(this).find(".ctc-block-field-label").text();
          const value = $(this).find("input").val() || "";

          if (!value) {
            return;
          }

          markup += label + ": " + value + "\n";
        });

        textarea.val(markup);
      });
    },
  };

  /**
   * Initialization
   */
  $(function () {
    CTCAIPromptGenerator.init();
  });
})(jQuery);
