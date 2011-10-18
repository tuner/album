/*
 * Copyright (c) 2010 Kari Lavikka
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var PictureBrowser = {
	pictureFrame: false,
	imgElement: false,
	captionElement: false,
	numberElement: false,
	closeButton: false,

	naviLeft: false,
	naviRight: false,

	shader: false,

	imagesDiv: false,
	thumbLinks: false,
	currentThumbLink: false,
	pendingImage: false,
	hashMonitorEnabled: true,

	ie: /msie/i.test(navigator.userAgent) && !window.opera,
	pictureFirst: false, // url was to an image
	inTrasition: false, // effect in effect

	updatePicture: function(event, a) {
		if (event) Event.stop(event);
		if (this.inTransition) return;

		this.hashMonitorEnabled = false;
		window.location.hash = /[^\/]+$/.exec(a.href)[0];
		this.imgElement.src = a.href;
		
		var imgElement = a.firstChild;
		if (imgElement.title) {
			this.captionElement.innerHTML = imgElement.title;
			this.captionElement.style.display = "block";
		} else {
			this.captionElement.style.display = "none";
		}

		var x = this.thumbLinks.indexOf(a) + 1;
		this.numberElement.textContent = "Kuva " + x + " / " + this.thumbLinks.size();

		this.currentThumbLink = a;
	},

	goBack: function() {
		if (document.location.hash.length > 1) {
			if (!this.ie && !this.pictureFirst && window.location.hash.length > 1) {
				history.back();
			} else {
				window.location.hash = "#";
				this.pictureFirst = false;
			}
		}

	},

	updatePictureFromHash: function() {
		if (window.location.hash.length > 1) {
			var links = this.imagesDiv.getElementsByTagName("a");
			var r = new RegExp(/[^#]+$/.exec(window.location.hash)[0] + "$");
			for (var n = 0; n < links.length; n++) {
				if (r.test(links[n].href)) {
					this.updatePicture.bind(this, null, links[n])();
					this.pictureFirst = true;
					break;
				}
			}
		}
	},

	hidePictureFrame: function() {
		var effects = new Array();

		effects.push(new Effect.Opacity(this.pictureFrame, {
			sync: true, from: 1, to: 0,
			afterFinish: function() { this.pictureFrame.style.visibility = "hidden"; }.bind(this)
		}));

		if (!this.pendingImage) {
			effects.push(new Effect.Opacity(this.shader, {
				sync: true, from: 0.7, to: 0,
				afterFinish: function() { this.shader.style.visibility = "hidden"; }.bind(this)
			}));

		}

		var x = this.pendingImage ? this.thumbLinks.indexOf(this.pendingImage) : -1;

		if (x < 1) {
			effects.push(new Effect.Opacity(this.naviLeft, {
				sync: true, from: 1, to: 0,
				afterFinish: function() { this.naviLeft.style.visibility = "hidden"; }.bind(this)
			}));
		}

		if (x < 0 || x > this.thumbLinks.size() - 2) {
			effects.push(new Effect.Opacity(this.naviRight, {
				sync: true, from: 1, to: 0,
				afterFinish: function() { this.naviRight.style.visibility = "hidden"; }.bind(this)
			}));
		}

		new Effect.Parallel(effects, {
			duration: 0.2,
			afterFinish: function() {
				this.inTransition = false;

				// prevent scrollbars if picture size changes before repositioning
				this.pictureFrame.style.top = "0";
				this.pictureFrame.style.left = "0";

				if (this.pendingImage) {
					this.updatePicture(false, this.pendingImage);
					this.pendingImage = false;
				} else {
					this.hashMonitorEnabled = true;
				}
			}.bind(this),
			beforeStart: function() { this.inTransition = true; }.bind(this)
		});
	},

	showPictureFrame: function() {
		var effects = new Array();

		effects.push(new Effect.Opacity(this.pictureFrame, {
			sync: true, from: 0, to: 1,
			beforeStart: function() { this.pictureFrame.style.visibility = "visible"; }.bind(this)
		}));

		if (this.shader.style.visibility == "hidden") {
			effects.push(new Effect.Opacity(this.shader, {
				sync: true, from: 0, to: 0.7,
				beforeStart: function() { this.shader.style.visibility = "visible"; }.bind(this)
			}));
		}

		var x = this.thumbLinks.indexOf(this.currentThumbLink);

		if (x > 0 && this.naviLeft.style.visibility == "hidden") {
			effects.push(new Effect.Opacity(this.naviLeft, {
				sync: true, from: 0, to: 1,
				beforeStart: function() { this.naviLeft.style.visibility = "visible"; }.bind(this)
			}));
		}

		if (x < this.thumbLinks.size() - 1 && this.naviRight.style.visibility == "hidden") {
			effects.push(new Effect.Opacity(this.naviRight, {
				sync: true, from: 0, to: 1,
				beforeStart: function() { this.naviRight.style.visibility = "visible"; }.bind(this)
			}));
		}
		
		new Effect.Parallel(effects, {
			duration: 0.25,
			afterFinish: function() {
				this.inTransition = false;

	 			// preload next/prev
				var x = this.thumbLinks.indexOf(this.currentThumbLink);
				if (x > 0) {
					var i = new Image();
					i.src = this.thumbLinks[x - 1].href;
				}
				if (x < this.thumbLinks.size() - 1) {
					var i = new Image();
					i.src = this.thumbLinks[x + 1].href;
				}
				this.hashMonitorEnabled = true;
			}.bind(this),
			beforeStart: function() { this.inTransition = true; }.bind(this)
		});
	},

	// kludge for monitoring back/forward. IE8 has an onHashChange event but no other browsers has it atm.
	hashMonitor: function() {
		if (!this.inTransition && this.hashMonitorEnabled) {
			if (this.pictureFrame.style.visibility == "visible" && (!window.location.hash || window.location.hash == "#")) {
				this.hidePictureFrame();
			} else if (this.pictureFrame.style.visibility == "hidden" && window.location.hash.length > 1) {
				this.updatePictureFromHash();
			}
		}
		setTimeout(this.hashMonitor.bind(this), 200);
	},

	navigate: function(direction) {
		var x = this.thumbLinks.indexOf(this.currentThumbLink);

		switch (direction) {
		case -1: // prev
			if (x > 0) {
				x--;
			} else {
				return;
			}
			break;
		case 1: // next
			if (x < this.thumbLinks.size() - 1) {
				x++;
			} else {
				return;
			}
			break;
		default:
			return;
		}

		this.pictureFirst = true; // can't go back to thumbnail view using history.back();
		this.hashMonitorEnabled = false;
		this.pendingImage = this.thumbLinks[x];
		this.hidePictureFrame();
	},

	init: function() {
		this.pictureFrame = new Element("div");
		this.pictureFrame.id = "pictureFrame";
		this.pictureFrame.setOpacity(0);
		this.pictureFrame.style.visibility = "hidden";

		this.imgElement = new Element("img");
		this.imgElement.style.cursor = "pointer";
		this.pictureFrame.appendChild(this.imgElement);

		Event.observe(this.imgElement, 'load', function() {
			var scrollTop = document.viewport.getScrollOffsets()[1] + 5;
			var thumbsTop = Element.cumulativeOffset(this.imagesDiv)[1];

			var top = (scrollTop > thumbsTop ? scrollTop : thumbsTop);
			this.pictureFrame.style.left = (document.viewport.getWidth() - this.pictureFrame.offsetWidth) / 2 + "px";
			this.pictureFrame.style.top = top + "px"; 

			this.naviLeft.style.top = (top + 40) + "px"
			this.naviRight.style.top = (top + 40) + "px"

			if (this.pictureFrame.style.visibility != "visible") this.showPictureFrame();

		}.bind(this));

		Event.observe(window, 'resize', function() {
			this.pictureFrame.style.left = (document.viewport.getWidth() - this.pictureFrame.offsetWidth) / 2 + "px";
		}.bind(this));

		Event.observe(this.imgElement, 'click', function(event) {
			Event.stop(event);
			if (this.inTransition) return;
			this.pendingImage = false;
			this.hidePictureFrame();
			this.goBack();
		}.bind(this));

		this.numberElement = new Element("p", {id: "number"});
		this.pictureFrame.appendChild(this.numberElement);
	
		this.captionElement = new Element("p", {id: "caption"});
		this.captionElement.style.display = "none"
		this.pictureFrame.appendChild(this.captionElement);

		this.closeButton = new Element("a", {id: "close", href: "#"});
		this.closeButton.update("Sulje");
		this.pictureFrame.appendChild(this.closeButton);

		Event.observe(this.closeButton, "click", function(event) {
			Event.stop(event);
			if (this.inTransition) return;
			this.pendingImage = false;
			this.hidePictureFrame();
			this.goBack();
		}.bindAsEventListener(this));

		Event.observe(document, "keydown", function(event) {
			if (!this.currentThumbLink || this.inTransition) {
				Event.stop(event);
				return;
			}

			switch (event.keyCode) {
			case 37: // prev
				this.navigate(-1);
				break;
			case 39: // next
				this.navigate(1);
				break;
			default:
				return;
			}
		}.bindAsEventListener(this));

		this.imagesDiv = $("thumbs");

		document.body.appendChild(this.pictureFrame);


		this.naviLeft = new Element("div", {id: "naviLeft", "class": "naviButton"});
		this.naviLeft.addClassName("naviButton"); // IE8 kludge
		this.naviLeft.setStyle({opacity: 0, visibility: "hidden"});
		e = new Element("div", {"class": "naviImage"});
		this.naviLeft.appendChild(e);
		e = new Element("div", {"class": "naviText"});
		e.update("Edellinen");
		this.naviLeft.appendChild(e);
		Event.observe(this.naviLeft, "click", function(e) { Event.stop(e); this.navigate(-1); return false }.bindAsEventListener(this));
		document.body.appendChild(this.naviLeft);

		this.naviRight = new Element("div", {id: "naviRight", "class": "naviButton"});
		this.naviRight.addClassName("naviButton"); // IE8 kludge
		this.naviRight.setStyle({opacity: 0, visibility: "hidden"});
		e = new Element("div", {"class": "naviImage"});
		this.naviRight.appendChild(e);
		e = new Element("div", {"class": "naviText"});
		e.update("Seuraava");
		this.naviRight.appendChild(e);
		Event.observe(this.naviRight, "click", function(e) { Event.stop(e); this.navigate(1); return false }.bindAsEventListener(this));
		document.body.appendChild(this.naviRight);

		this.shader = new Element("div", {id: "shader"});
		this.shader.setOpacity(0);
		this.shader.style.visibility = "hidden";

		this.imagesDiv.appendChild(this.shader);

		this.thumbLinks = $A(this.imagesDiv.getElementsByTagName("a"));

		this.thumbLinks.each(function(item) {
			Event.observe(item, 'click', this.updatePicture.bindAsEventListener(this, item)); // TODO: this
		}.bind(this));

		this.updatePictureFromHash();

		setTimeout(this.hashMonitor.bind(this), 500);
	}

}

Event.observe(document, 'dom:loaded', PictureBrowser.init.bindAsEventListener(PictureBrowser));
