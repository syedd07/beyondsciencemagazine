document.addEventListener('DOMContentLoaded', function () {
	// Show the pop-up after 4 seconds
	setTimeout(function() {
		document.getElementById('popup').style.display = 'block';
	}, 4000); // Show after 4 seconds

	// Hide the pop-up and show the reconsider message when clicking the close button
	document.getElementById('popupClose').addEventListener('click', function() {
		hidePopupAndShowReconsider();
	});

	// Hide the pop-up and show the reconsider message when clicking outside of the pop-up content
	window.addEventListener('click', function(event) {
		if (event.target === document.getElementById('popup')) {
			hidePopupAndShowReconsider();
		}
	});

	// Function to hide the popup and show the reconsider message
	function hidePopupAndShowReconsider() {
		var popup = document.getElementById('popup');
		var promotionMessage = document.getElementById('promotion-message');
		var reconsiderMessage = document.getElementById('reconsider-message');

		// Hide the popup
		popup.style.display = 'none';

		// Show the reconsider message
		promotionMessage.style.display = 'none';
		reconsiderMessage.style.display = 'block';
	}
});

//e-book & contact custom url
document.addEventListener("DOMContentLoaded", function() {
    // Check the URL parameter to determine where the form submission came from
    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get('formType'); // Capture the form type parameter
    
    const messageContainer = document.getElementById('dynamic-message'); // Assuming this ID exists in your thank.html

    if (formType === 'ebook') {
        // Append e-book message
        messageContainer.innerHTML = `
            <p>Thank you for requesting the e-book! We appreciate your interest and will send it to you via email shortly. 
            If you have any questions or need immediate assistance, feel free to contact us at Contact us.</p>`;
    } else if (formType === 'contact') {
        // Append contact form message
        messageContainer.innerHTML = `
            <p>Thank you for contacting us! We’ll get back to you shortly.</p>`;
    }
});


document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form');
    var loader = document.getElementById('loader');

    form.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Show the loader
        loader.style.display = 'flex';

        // Wait for 4 seconds before submitting the form
        setTimeout(function() {
            // Submit the form
            form.submit();
        }, 4000); // 4000 milliseconds = 4 seconds
    });
});
(function($) {

	var	$window = $(window),
		$head = $('head'),
		$body = $('body');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ '361px',   '480px'  ],
			xxsmall:  [ null,      '360px'  ],
			'xlarge-to-max':    '(min-width: 1681px)',
			'small-to-xlarge':  '(min-width: 481px) and (max-width: 1680px)'
		});

	// Stops animations/transitions until the page has ...

		// ... loaded.
			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-preload');
				}, 100);
			});

		// ... stopped resizing.
			var resizeTimeout;

			$window.on('resize', function() {

				// Mark as resizing.
					$body.addClass('is-resizing');

				// Unmark after delay.
					clearTimeout(resizeTimeout);

					resizeTimeout = setTimeout(function() {
						$body.removeClass('is-resizing');
					}, 100);

			});

	// Fixes.

		// Object fit images.
			if (!browser.canUse('object-fit')
			||	browser.name == 'safari')
				$('.image.object').each(function() {

					var $this = $(this),
						$img = $this.children('img');

					// Hide original image.
						$img.css('opacity', '0');

					// Set background.
						$this
							.css('background-image', 'url("' + $img.attr('src') + '")')
							.css('background-size', $img.css('object-fit') ? $img.css('object-fit') : 'cover')
							.css('background-position', $img.css('object-position') ? $img.css('object-position') : 'center');

				});

	// Sidebar.
		var $sidebar = $('#sidebar'),
			$sidebar_inner = $sidebar.children('.inner');

		// Inactive by default on <= large.
			breakpoints.on('<=large', function() {
				$sidebar.addClass('inactive');
			});

			breakpoints.on('>large', function() {
				$sidebar.removeClass('inactive');
			});

		// Hack: Workaround for Chrome/Android scrollbar position bug.
			if (browser.os == 'android'
			&&	browser.name == 'chrome')
				$('<style>#sidebar .inner::-webkit-scrollbar { display: none; }</style>')
					.appendTo($head);

		// Toggle.
			$('<a href="#sidebar" class="toggle">Toggle</a>')
				.appendTo($sidebar)
				.on('click', function(event) {

					// Prevent default.
						event.preventDefault();
						event.stopPropagation();

					// Toggle.
						$sidebar.toggleClass('inactive');

				});

		// Events.

			// Link clicks.
				$sidebar.on('click', 'a', function(event) {

					// >large? Bail.
						if (breakpoints.active('>large'))
							return;

					// Vars.
						var $a = $(this),
							href = $a.attr('href'),
							target = $a.attr('target');

					// Prevent default.
						event.preventDefault();
						event.stopPropagation();

					// Check URL.
						if (!href || href == '#' || href == '')
							return;

					// Hide sidebar.
						$sidebar.addClass('inactive');

					// Redirect to href.
						setTimeout(function() {

							if (target == '_blank')
								window.open(href);
							else
								window.location.href = href;

						}, 500);

				});

			// Prevent certain events inside the panel from bubbling.
				$sidebar.on('click touchend touchstart touchmove', function(event) {

					// >large? Bail.
						if (breakpoints.active('>large'))
							return;

					// Prevent propagation.
						event.stopPropagation();

				});

			// Hide panel on body click/tap.
				$body.on('click touchend', function(event) {

					// >large? Bail.
						if (breakpoints.active('>large'))
							return;

					// Deactivate.
						$sidebar.addClass('inactive');

				});

		// Scroll lock.
		// Note: If you do anything to change the height of the sidebar's content, be sure to
		// trigger 'resize.sidebar-lock' on $window so stuff doesn't get out of sync.

			$window.on('load.sidebar-lock', function() {

				var sh, wh, st;

				// Reset scroll position to 0 if it's 1.
					if ($window.scrollTop() == 1)
						$window.scrollTop(0);

				$window
					.on('scroll.sidebar-lock', function() {

						var x, y;

						// <=large? Bail.
							if (breakpoints.active('<=large')) {

								$sidebar_inner
									.data('locked', 0)
									.css('position', '')
									.css('top', '');

								return;

							}

						// Calculate positions.
							x = Math.max(sh - wh, 0);
							y = Math.max(0, $window.scrollTop() - x);

						// Lock/unlock.
							if ($sidebar_inner.data('locked') == 1) {

								if (y <= 0)
									$sidebar_inner
										.data('locked', 0)
										.css('position', '')
										.css('top', '');
								else
									$sidebar_inner
										.css('top', -1 * x);

							}
							else {

								if (y > 0)
									$sidebar_inner
										.data('locked', 1)
										.css('position', 'fixed')
										.css('top', -1 * x);

							}

					})
					.on('resize.sidebar-lock', function() {

						// Calculate heights.
							wh = $window.height();
							sh = $sidebar_inner.outerHeight() + 30;

						// Trigger scroll.
							$window.trigger('scroll.sidebar-lock');

					})
					.trigger('resize.sidebar-lock');

				});

	// Menu.
		var $menu = $('#menu'),
			$menu_openers = $menu.children('ul').find('.opener');

		// Openers.
			$menu_openers.each(function() {

				var $this = $(this);

				$this.on('click', function(event) {

					// Prevent default.
						event.preventDefault();

					// Toggle.
						$menu_openers.not($this).removeClass('active');
						$this.toggleClass('active');

					// Trigger resize (sidebar lock).
						$window.triggerHandler('resize.sidebar-lock');

				});

			});
	
			
})

 (jQuery);
 var element = document.documentElement,
body = document.body,
scrollTop = 'scrollTop',
 scrollHeight = 'scrollHeight',
 progress = document.querySelector('.progress-bar'),
 scroll;
 document.addEventListener('scroll', function() {
	scroll = (element[scrollTop]||body[scrollTop]) / ((element[scrollHeight]||body[scrollHeight]) - element.clientHeight) * 100;
	progress.style.setProperty('--scroll', scroll + '%');
});