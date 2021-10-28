if (typeof $.fn.modal !== 'function') {
	(function ($) {
		$.fn.modal = function (options) {
			var defaults = {
				show: false,
				overlayDrop: true
			}
			var options = $.extend(defaults, options);
			var $btnOpen = $('[data-toggle="modal"]');
			var modal = this;
			if (options.overlayDrop == true) {
				if ($('body').find('.modal-backdrop').length == 0) {
					$('body').prepend('<div class="modal-backdrop"></div>');
				}
				var overlay = $('.modal-backdrop');
			}
			function modalShow() {
				$('body').addClass('modal-open');
				modal.show();
				overlay.show();
				var windowH = $(window).height();
				var modalDialog = modal.find('.modal-content');
				var modalDialogH = modalDialog.height();
				var modalDialogHfix = windowH / 2 - modalDialogH + 50;
				if (modalDialogHfix < 0) {
					modalDialogHfix = 30;
				}
				modalDialog.css('margin-top', modalDialogHfix);
				$(window).resize(function () {
					var windowH = $(window).height();
					var modalDialog = modal.find('.modal-content');
					var modalDialogH = modalDialog.height();
					var modalDialogHfix = windowH / 2 - modalDialogH;
					if (modalDialogHfix < 0) {
						modalDialogHfix = 30;
					}
					modalDialog.css('margin-top', modalDialogHfix);
				});
			}
			if (options.show == true) {
				modalShow();
			}

		}
	})(jQuery);
	$(function () {
		$('[data-toggle="modal"]').click(function () {
			var target = $(this).attr('data-target');
			$(target).modal({ show: true })
			return false;
		});

		$('[data-dismiss="modal"]').click(function () {
			$('body').removeClass('modal-open');
			$('.modal-backdrop').hide();
			$('.modal').hide();
			return false;
		});

		$('.modal').click(function () {
			if ($(this).attr('aria-hidden') != 'false') {
				$('body').removeClass('modal-open');
				$('.modal-backdrop').hide();
				$('.modal').hide();
			}
			return false;
		});
		$('.modal-content').click(function (event) {
			event.stopPropagation();
		});
	});
}