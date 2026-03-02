(function ($) {
  const CTCCore = {
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
      $(document).on(
        "click",
        "body:not(.block-editor-page) .ctc-block-copy",
        this.doCopy
      );
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
     * Copy selection from element.
     *
     * @param {jQuery} $source jQuery element to copy selection from.
     * @return {Promise<boolean>} Success status.
     */
    copySelection: async function ($source) {
      if (!$source || !$source.length) {
        return false;
      }

      const element = $source.get(0);

      // Get text content, preserving line breaks.
      const clone = element.cloneNode(true);
      clone.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
      const text = clone.textContent || "";

      return this.copyToClipboard(text.trim());
    },

    /**
     * Do Copy to Clipboard
     */
    doCopy: async function (event) {
      event.preventDefault();

      let btn = $(this),
        btnText = btn.find(".ctc-button-text"),
        oldText = btnText.text(),
        copiedText = btn.attr("data-copied") || "Copied",
        copyAsRaw = btn.attr("copy-as-raw") || "",
        block = btn.parents(".ctc-block"),
        textarea = block.find(".ctc-copy-content"),
        content = textarea.val(),
        selectionTarget = textarea.attr("selection-target") || "";

      // Copy as selection.
      if (selectionTarget) {
        const source = $(selectionTarget);
        if (!source.length) {
          return;
        }

        await CTCCore.copySelection(source);
      } else {
        if (!copyAsRaw) {
          // Convert the <br/> tags into new line.
          content = content.replace(/<br\s*[\/]?>/gi, "\n");

          // Convert the <div> tags into new line.
          content = content.replace(/<div\s*[\/]?>/gi, "\n");

          // Convert the <p> tags into new line.
          content = content.replace(/<p\s*[\/]?>/gi, "\n\n");

          // Convert the <li> tags into new line.
          content = content.replace(/<li\s*[\/]?>/gi, "\n");

          // Remove all tags.
          content = content.replace(/(<([^>]+)>)/gi, "");

          // Remove white spaces.
          content = content.replace(new RegExp("/^s+$/"), "");
        }

        // Remove first and last new line.
        content = content.trim();

        // Copy using CTC CopyEngine.
        await CTCCore.copyToClipboard(content);
      }

      if (btn.hasClass("ctc-block-copy-icon")) {
        // Copied!
        btn.addClass("copied");
        setTimeout(function () {
          btn.removeClass("copied");
        }, 1000);
      } else {
        // Copied!
        btnText.text(copiedText);
        block.addClass("copied");
        setTimeout(function () {
          btnText.text(oldText);
          block.removeClass("copied");
        }, 1000);
      }
    },
  };

  /**
   * Initialization
   */
  $(function () {
    CTCCore.init();
  });
})(jQuery);
