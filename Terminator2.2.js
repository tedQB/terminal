(function(K) {
	var tabs = KClass.create({
		init: function(options) {
			this.opt = {
				id: "focus",
				tabTn: "li",
				conTn: "div",
				textTn: "",
				current: 0,
				auto: 0,
				direction: 1,
				eType: "click",
				curCn: "current",
				z: 100,
				fxspeed: 1000,
				interval: 2000,
				tempCn: [],
				effect: "def",
				pageBt: false,
				ipNewPage: false,
				fxOption: {},
				scrOption: {},
				tabOption: {}
			};
			K.extend(this.opt, options);
			var o = this;
			var opt = this.opt;
			this.current = opt.current;
			this.mousecurrent = opt.mousecurrent;
			this.slidecurrent = opt.slidecurrent;
			this.fxspeed = opt.fxOption.speed || 500;
			this.fxeffect = opt.fxOption.magic || "";
			this.scrstep = opt.scrOption.step || 1;
			this.screffect = opt.scrOption.magic || "";
			this.scrcol = opt.scrOption.scrcolumn || ".row1";
			this.showcolclass = opt.scrOption.showcolumn || ".showcolumn";
			this.shownum = opt.tabOption.shownum || 4;
			this.tabwr = opt.tabOption.tabwr;
			this.tabnum = opt.tabOption.tabnum;
			this.othertabTn = opt.otherTn || "";
			this.fadetime = 50;
			this.to = 0;
			this.cur = 0;
			this.oneFinger = false;
			this.fMoveX = 0;
			this.tevent = null;
			this.conId = opt.conId ? opt.conId: opt.id;
			this.tabId = opt.tabId ? opt.tabId: opt.id;
			this.textId = opt.textId ? opt.textId: opt.id;
			this.mbox = K(opt.id).node;
			this.cont = K(opt.conId).node;
			this.lock = 0;
			this.lock2 = 0;
			this.flipscrolling = 0;
			this.cons = opt.conCn ? K(this.conId).find(opt.conCn) : K(this.conId).find(opt.conTn);
			this.scrcont = K(this.conId).find(this.scrcol);
			this.levels = this.cons.len;
			this.tabs = opt.tabCn ? K(this.tabId).find(opt.tabCn) : K(this.tabId).find(opt.tabTn);
			this.texts = opt.textCn ? K(this.textId).find(opt.textCn) : K(this.textId).find(opt.textTn);
			this.tabitemlen = this.tabs.item(0).node.offsetWidth;
			this.effectFn = opt.conId && opt.effect && this.effects[opt.effect] ? this.effects[opt.effect] : this.effects.def;
			if (o.tabwr) {
				o.tabobj = K(o.opt.id).find(o.tabwr).item(0);
				o.y = o.tabobj.scrollLeft();
				o.tn = Math.floor(this.levels / this.tabnum) + 1;
				o.temptn = o.tn;
				o.sn = 1
			}
			if (opt.effect == "slide" || opt.effect == "fxslide") {
				this.cont.style.position = "absolute";
				this.Tol = opt.vertical == "top" ? "top": "left";
				this.ml = this.cons.item(0).node[opt.vertical == "top" ? "offsetHeight": "offsetWidth"]
			} else {
				if (opt.effect == "scroll") {
					this.cont.style.position = "absolute";
					this.Tol = opt.vertical == "top" ? "top": "left";
					this.ml = (this.cons.item(0).node[opt.vertical == "top" ? "offsetHeight": "offsetWidth"]);
					K(opt.id).find(this.showcolclass).item(0).setStyle({
						width: this.ml + "px",
						overflow: "hidden"
					});
					K(opt.id).setStyle({
						width: this.ml + 5 + "px"
					});
					K(this.conId).append(this.scrcont.item(0).clone(true));
					this.levels = K(this.conId).find(opt.conCn).len;
					this.total = (this.levels - 1) * this.ml
				} else {
					if (opt.effect == "fade") {
						if (!opt.pageBt) {
							this.cons.setStyle({
								position: "absolute",
								top: 0
							});
							o.tabs.opacity(0.5)
						}
					}
				}
			}
			this.nd = opt.extra ? parseHtmlStr(opt.extra[1]) : null;
			if (!this.effects.scroll && this.tabs.len != this.cons.len) {
				throw new Error("Match Failed");
				return
			}
			if (opt.effect != "scroll") {
				this.tabs.each(function(obj, i) {
					o.tevent = obj.bind("_" + opt.eType,
					function() {
						o.fixMoveTo(i);
						o.timeManger1(o)
					})
				})
			}
			if (opt.eType == "mouseover") {
				K(this.mbox).hover(function() {
					o.timeManger1(o)
				},
				function() {
					o.timeManger2(o)
				})
			} else {
				if (opt.eType == "click") {
					K(this.mbox).bind("click",
					function() {
						o.timeManger1(o)
					});
					K(this.mbox).bind("mouseout",
					function() {
						o.timeManger2(o)
					})
				} else {
					if (opt.effect == "flip") {
						this.tabs.each(function(obj, i) {
							obj.bind("mouseout",
							function() {
								o.runId && clearTimeout(o.runId);
								o.flipscrolling = 1;
								o.opt.auto && (o.runId = setTimeout(function() {
									o.next()
								},
								o.opt.interval))
							})
						})
					}
				}
			}
			var thObj = K(this.conId);
			o.th1 = null;
			o.th2 = 1;
			o.th3 = 0;
			thObj.bind("_touchstart",
			function() {
				o.tochStart(event)
			});
			K().bind("gesturestart",
			function() {
				thObj.unbind("_touchstart", o.th1);
				o.th2 = 1
			});
			K().bind("gestureend",
			function() {
				o.th2 = 0
			});
			thObj.bind("touchend",
			function() {
				o.th1 = thObj.bind("_touchstart",
				function() {
					o.tochSE(event)
				});
				o.th2 = 0
			});
			this.cons.each(function(obj, i) {
				if (!opt.tabCn) {
					var el = obj.find("img").item(0);
					el.bind("touchend",
					function() {
						o.tochEnd(event, el);
						o.th2 = 1
					})
				} else {
					obj.bind("touchend",
					function() {
						o.tochEnd(event, 0);
						o.th2 = 1
					})
				}
			});
			if (opt.bns && opt.bns.length == 2) {
				K(opt.id).find(opt.bns[0]).item(0).click(function() {
					if (opt.effect == "scroll" && !o.tabwr) {
						o.scrprev()
					} else {
						if (opt.effect && o.tabwr) {
							o.tabprev(o)
						} else {
							o.prev()
						}
					}
				});
				K(opt.id).find(opt.bns[1]).item(0).click(function() {
					if (opt.effect == "scroll" && !o.tabwr) {
						o.scrnext()
					} else {
						if (opt.effect && o.tabwr) {
							o.tabnext(o)
						} else {
							o.next()
						}
					}
				})
			}
			if (opt.effect == "scroll") {
				o.scrTo(this.current)
			} else {
				o.moveTo(this.current)
			}
			if (opt.totalId) {
				K(opt.totalId).html(this.levels)
			}
		},
		linkTo: function(el) {
			if (this.opt.ipNewPage) {
				window.open(el.parent().node.href, "_blank")
			} else {
				window.location.href = el.parent().node.href
			}
		},
		linkBl: function(url) {
			window.location.href = url
		},
		tochStart: function(e) {
			e.stopImmediatePropagation();
			if (!this.th2) {
				e.preventDefault()
			}
			if (e.targetTouches.length > 1) {
				this.oneFinger = false;
				return
			} else {
				this.oneFinger = true
			}
			this.fMoveX = e.changedTouches[0].pageX;
			this.th2 = 1
		},
		tochSE: function(e) {
			e.preventDefault()
		},
		tochEnd: function(e, el) {
			var node = e.target;
			if (node.href) {
				var href = node.href
			}
			this.th2 = 1;
			if (!this.oneFinger) {
				return
			}
			if (this.fMoveX < e.changedTouches[0].pageX) {
				this.tcTime();
				this.prev()
			} else {
				if (this.fMoveX > e.changedTouches[0].pageX) {
					this.tcTime();
					this.next()
				} else {
					if (!el) {
						if (href) {
							this.linkBl(href)
						} else {
							return
						}
					} else {
						return this.linkTo(el)
					}
				}
			}
		},
		effects: {
			def: function(o, n) {
				o.cons.setStyle("display", "none");
				o.cons.item(n).setStyle("display", "block");
				o.opt.auto && (o.runId = setTimeout(function() {
					o.next()
				},
				o.opt.interval))
			},
			fxslide: function(o, n, to) {
				if (o.opt.vertical == "top") {
					K(o.cont).go({
						top: to + "px"
					},
					o.fxspeed, o.fxeffect).delay(100)
				} else {
					if (o.opt.vertical == "left") {
						K(o.cont).go({
							left: to + "px"
						},
						o.fxspeed, o.fxeffect).delay(10)
					}
				}
				o.opt.auto && (o.runId = setTimeout(function() {
					o.next()
				},
				o.opt.interval))
			},
			scroll: function(o, n, to) {
				if (o.opt.vertical == "top") {
					K(o.cont).go({
						top: to + "px"
					},
					o.fxspeed, o.fxeffect).delay(10)
				} else {
					if (o.opt.vertical == "left") {
						if (n == 3) {
							K(o.cont).go({
								left: to + "px"
							},
							o.fxspeed, o.fxeffect,
							function() {
								K(o.cont).node.style.left = "0px"
							})
						} else {
							K(o.cont).go({
								left: to + "px"
							},
							o.fxspeed, o.fxeffect).delay(10)
						}
					}
				}
				o.opt.auto && (o.runId = setTimeout(function() {
					o.scrnext()
				},
				o.opt.interval))
			},
			slide: function(o, n, to) {
				var y = parseInt(o.cont.style[o.Tol] ? o.cont.style[o.Tol] : "0px");
				o.end = (y == to) ? 1: 0;
				if (!o.end) {
					if (y < to) {
						y += Math.ceil((to - y) / 10)
					}
					if (y > to) {
						y -= Math.ceil((y - to) / 10)
					}
					o.cont.style[o.Tol] = y + "px";
					o.runId = setTimeout(function() {
						o.effectFn(o, n, to)
					},
					10)
				} else {
					o.opt.auto && (o.runId = setTimeout(function() {
						o.next()
					},
					o.opt.interval))
				}
			},
			fade: function(o, n) {
				var cur = 0;
				o.cons.setStyle("display", "none");
				o.cons.item(n).setStyle("display", "block");
				var img = o.cons.item(n).find("img").nitem(0); (function() {
					o.runffId && clearTimeout(o.runffId);
					if (cur < 100) {
						cur += Math.ceil((100 - cur) / 10);
						setOpacity(img, cur);
						o.runffId = setTimeout(arguments.callee, o.fadetime)
					} else {
						return true
					}
				})()
			},
			flip: function(o, n) {
				if (o.flipscrolling) {
					return false
				}
				var m = function(a) {
					if (a && a.indexOf("#") == -1 && a.indexOf("(") == -1) {
						return "rgb(" + l[a].toString() + ")"
					} else {
						return a
					}
				};
				var newContent = function() {
					var a = c2.node.innerHTML;
					return a
				};
				var la = function() {
					$clone.css("visibility", "hidden").html("").css({
						visibility: "visible",
						position: "absolute",
						left: flipObj.left + "px",
						top: flipObj.top + "px",
						margin: 0,
						zIndex: 9999
					});
					$clone.ready = 1;
					K(o.conId).append($clone)
				};
				o.cons.setStyle("display", "none");
				o.cons.item(n).setStyle("display", "block");
				var c = o.cons.item(n),
				c2 = o.cons.item(n + 1),
				flipObj,
				dirOption,
				dirOptions,
				newContent;
				var $clone = c.clone(true);
				var e = {
					direction: (function(a) {
						switch (a) {
						case "tb":
							return "bt";
						case "bt":
							return "tb";
						case "lr":
							return "rl";
						case "rl":
							return "lr";
						default:
							return "bt"
						}
					})(o.opt.direction),
					content: c.html(),
					speed: o.speed || 500,
					onBefore: o.onBefore ||
					function() {},
					onEnd: o.onEnd ||
					function() {},
					onAnimation: o.onAnimation ||
					function() {}
				};
				flipObj = {
					width: c.width(),
					height: c.height(),
					fontSize: c.css("font-size") || "12px",
					direction: o.opt.direction || "tb",
					bgColor: m(o.opt.fromcolor) || c.css("background-color"),
					toColor: m(o.opt.tocolor) || "red",
					speed: o.opt.speed || 1000,
					top: c.parentX(),
					left: c.parentY(),
					target: o.opt.content || null,
					transparent: "transparent",
					dontChangeColor: o.opt.dontChangeColor || false,
					onBefore: o.opt.onBefore ||
					function() {},
					onEnd: o.opt.onEnd ||
					function() {},
					onAnimation: o.opt.onAnimation ||
					function() {}
				};
				K.B.ie6 && (flipObj.transparent = "#123456");
				var f = function() {
					return {
						backgroundColor: flipObj.transparent,
						fontSize: 0 + "px",
						lineHeight: 0 + "px",
						borderTopWidth: 0 + "px",
						borderLeftWidth: 0 + "px",
						borderRightWidth: 0 + "px",
						borderBottomWidth: 0 + "px",
						borderTopColor: flipObj.transparent,
						borderBottomColor: flipObj.transparent,
						borderLeftColor: flipObj.transparent,
						borderRightColor: flipObj.transparent,
						background: "none",
						borderStyle: "solid",
						height: 0 + "px",
						width: 0 + "px"
					}
				};
				var g = function() {
					var a = (flipObj.height / 100) * 25;
					var b = f();
					b.width = flipObj.width + "px";
					return {
						start: b,
						first: {
							borderTopWidth: 0 + "px",
							borderLeftWidth: a + "px",
							borderRightWidth: a + "px",
							borderBottomWidth: 0 + "px",
							borderTopColor: o.opt.tocolor,
							borderBottomColor: o.opt.tocolor,
							top: (flipObj.top + (flipObj.height / 2)) + "px",
							left: (flipObj.left - a) + "px"
						},
						second: {
							borderTopWidth: 0 + "px",
							borderLeftWidth: 0 + "px",
							borderRightWidth: 0 + "px",
							borderBottomWidth: 0 + "px",
							borderTopColor: flipObj.transparent,
							borderBottomColor: flipObj.transparent,
							top: flipObj.top + "px",
							left: flipObj.left + "px"
						}
					}
				};
				var h = function() {
					var a = (flipObj.height / 100) * 25;
					var b = f();
					b.height = flipObj.height + "px";
					return {
						start: b,
						first: {
							borderTopWidth: a + "px",
							borderLeftWidth: 0 + "px",
							borderRightWidth: 0 + "px",
							borderBottomWidth: a + "px",
							borderLeftColor: o.opt.tocolor,
							borderRightColor: o.opt.tocolor,
							top: flipObj.top - a + "px",
							left: (flipObj.left + (flipObj.width / 2)) + "px"
						},
						second: {
							borderTopWidth: 0 + "px",
							borderLeftWidth: 0 + "px",
							borderRightWidth: 0 + "px",
							borderBottomWidth: 0 + "px",
							borderLeftColor: flipObj.transparent,
							borderRightColor: flipObj.transparent,
							top: flipObj.top + "px",
							left: flipObj.left + "px"
						}
					}
				};
				dirOptions = {
					tb: function() {
						var d = g();
						d.start.borderTopWidth = flipObj.height + "px";
						d.start.borderTopColor = flipObj.bgColor;
						d.second.borderBottomWidth = flipObj.height + "px";
						d.second.borderBottomColor = flipObj.toColor;
						return d
					},
					bt: function() {
						var d = g();
						d.start.borderBottomWidth = flipObj.height + "px";
						d.start.borderBottomColor = flipObj.bgColor;
						d.second.borderTopWidth = flipObj.height + "px";
						d.second.borderTopColor = flipObj.toColor;
						return d
					},
					lr: function() {
						var d = h();
						d.start.borderLeftWidth = flipObj.width + "px";
						d.start.borderLeftColor = flipObj.bgColor;
						d.second.borderRightWidth = flipObj.width + "px";
						d.second.borderRightColor = flipObj.toColor;
						return d
					},
					rl: function() {
						var d = h();
						d.start.borderRightWidth = flipObj.width + "px";
						d.start.borderRightColor = flipObj.bgColor;
						d.second.borderLeftWidth = flipObj.width + "px";
						d.second.borderLeftColor = flipObj.toColor;
						return d
					}
				};
				var scroll = function() {
					o.cons.item(n).setStyle("marginLeft", "-999px");
					la();
					dirOption = dirOptions[flipObj.direction]();
					K.B.ie6 && (dirOption.start.filter = "chroma(color=" + flipObj.transparent + ")");
					var over = 0;
					o.flipscrolling = 1;
					$clone.html("").setStyle(dirOption.start);
					$clone.setStyle("marginLeft", "auto");
					$clone.go(dirOption.first, o.opt.interval / 2);
					$clone.go(dirOption.second, o.opt.interval / 2, "",
					function() {
						o.cons.item(n).setStyle("marginLeft", "auto");
						$clone.remove();
						o.flipscrolling = 0
					});
					o.lock = 0
				};
				if (o.opt.auto || o.lock == 1) {
					scroll()
				}
				o.opt.auto && (o.runId = setTimeout(function() {
					o.next()
				},
				o.opt.interval + 500));
				return false
			},
			tabscroll: function(o, n, scrlen) {
				o.runssId && clearTimeout(o.runssId);
				o.scrlen = scrlen;
				o.end1 = (o.y == scrlen) ? 1: 0;
				if (!o.end1) {
					if (o.y < scrlen) {
						o.y += Math.ceil((scrlen - o.y) / 5)
					}
					if (o.y > scrlen) {
						o.y -= Math.ceil((o.y - scrlen) / 5)
					}
					o.tabobj.scrollLeft(o.y);
					o.runssId = setTimeout(function() {
						o.effects.tabscroll(o, n, scrlen)
					},
					10)
				} else {
					return false
				}
			}
		},
		consFix: function(o, to, divisor) {
			if (o.opt.effect == "slide") {
				if (o.opt.vertical == "left") {
					K(o.cont).go({
						left: to + "px"
					},
					o.fxspeed / divisor).delay(10)
				} else {
					if (o.opt.vertical == "top") {
						K(o.cont).go({
							top: to + "px"
						},
						o.fxspeed / divisor).delay(10)
					}
				}
			} else {
				if (o.opt.vertical == "left") {
					if (!o.lock2) {
						return false
					}
					o.lock2 = 1;
					K(o.cont).go({
						left: to + "px"
					},
					o.fxspeed / divisor, o.fxeffect).delay(10);
					o.lock2 = 0
				} else {
					if (o.opt.vertical == "top") {
						if (!o.lock2) {
							return false
						}
						o.lock2 = 1;
						K(o.cont).go({
							top: to + "px"
						},
						o.fxspeed / divisor, o.fxeffect).delay(10);
						o.lock2 = 0
					}
				}
			}
		},
		tabsFix: function(o, scrlen) {
			if (o.opt.vertical == "left") {
				if (o.tabwr) {
					o.effects.tabscroll(o, o.current, scrlen)
				}
			} else {
				if (o.opt.vertical == "top") {}
			}
		},
		timeManger1: function(o) {
			if (o.opt.effect == "def") {
				o.runId && clearTimeout(o.runId)
			} else {
				if (o.opt.effect == "fxslide" || o.opt.effect == "slide" && !o.end) {
					var to = o.to;
					var scrlen = o.scrlen;
					var y = parseInt(o.cont.style[o.Tol] ? o.cont.style[o.Tol] : "0px");
					var end = (y == to) ? 1: 0;
					if (!end) {
						if (o.opt.effect == "slide") {
							o.consFix(o, to, 3);
							o.tabsFix(o, scrlen)
						} else {
							if (o.opt.effect == "fxslide") {
								o.consFix(o, to, 10);
								o.tabsFix(o, scrlen)
							}
						}
						o.opt.mousecurrent = this.current;
						o.runId && clearTimeout(o.runId)
					}
				} else {
					if (o.opt.effect == "fade") {
						o.opt.mousecurrent = this.current;
						o.runId && clearTimeout(o.runId)
					} else {
						if (o.opt.effect == "flip") {
							o.lock = 1;
							o.runId && clearTimeout(o.runId);
							return false
						} else {
							o.opt.mousecurrent = this.current;
							o.runId && clearTimeout(o.runId)
						}
					}
				}
			}
		},
		timeManger2: function(o) {
			if (o.opt.effect == "fade") {
				o.runId && clearTimeout(o.runId);
				o.opt.auto && (o.runId = setTimeout(function() {
					o.next()
				},
				o.opt.interval))
			} else {
				if (o.opt.effect == "flip") {
					o.runId && clearTimeout(o.runId);
					o.opt.auto && (o.runId = setTimeout(function() {
						o.next()
					},
					o.opt.interval))
				} else {
					o.runId && clearTimeout(o.runId);
					o.opt.auto && (o.runId = setTimeout(function() {
						o.next()
					},
					o.opt.interval))
				}
			}
		},
		tabMoveFix: function(o, n) {
			if (this.opt.effect == "slide" || this.opt.effect == "fxslide" || this.opt.effect == "scroll") {
				o.to = "-" + n * this.ml;
				this.end = 0
			} else {
				if (this.opt.effect == "fade") {
					if (!this.opt.pageBt) {
						o.tabs.opacity(0.5);
						o.tabs.item(n).opacity(1)
					}
				}
			}
			K.A.each(this.levels,
			function(i) {
				if (n == i) {
					o.tabs.item(i).addClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).addClass(o.opt.curCn)
					}
				} else {
					o.tabs.item(i).removeClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).removeClass(o.opt.curCn)
					}
				}
			});
			o.current = n;
			o.effectFn(o, n, o.to)
		},
		tabnext: function(o) {
			o.runId && clearTimeout(o.runId);
			var n = o.current;
			if (o.tabwr) {
				var scrlen = o.tabnum * o.tabitemlen * o.sn;
				if (o.sn < o.tn) {
					if (o.opt.effect == "def") {
						K(o.opt.id).find(o.tabwr).item(0).scrollLeft(scrlen)
					} else {
						if (o.opt.effect == "slide" || o.opt.effect == "fxslide" || o.opt.effect == "fade") {
							o.effects.tabscroll(o, n, scrlen)
						} else {
							K(o.opt.id).find(o.tabwr).item(0).scrollLeft(scrlen)
						}
					}
					o.tabMoveFix(o, o.shownum);
					o.sn++;
					o.tn--
				} else {
					if (o.opt.effect == "def") {
						K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
					} else {
						if (o.opt.effect == "slide" || o.opt.effect == "fxslide" || o.opt.effect == "fade") {
							o.effects.tabscroll(o, n, 0)
						} else {
							K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
						}
					}
					o.tabMoveFix(o, 0);
					o.sn = 1;
					o.tn = o.temptn
				}
			}
		},
		tabprev: function(o) {
			o.runId && clearTimeout(o.runId);
			var n = o.current;
			if (o.tabwr) {
				var scrlen = o.tabitemlen * (o.levels / 2);
				scrlen = scrlen - o.tabnum * o.tabitemlen * (o.sn - 1);
				if (o.sn < o.tn) {
					if (o.opt.effect == "def") {
						K(o.opt.id).find(o.tabwr).item(0).scrollLeft(scrlen)
					} else {
						if (o.opt.effect == "slide" || o.opt.effect == "fxslide" || o.opt.effect == "fade") {
							o.effects.tabscroll(o, n, scrlen)
						} else {
							K(o.opt.id).find(o.tabwr).item(0).scrollLeft(scrlen)
						}
					}
					o.tabMoveFix(o, o.shownum);
					o.sn++;
					o.tn--
				} else {
					if (o.opt.effect == "def") {
						K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
					} else {
						if (o.opt.effect == "slide" || o.opt.effect == "fxslide" || o.opt.effect == "fade") {
							o.effects.tabscroll(o, n, 0)
						} else {
							K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
						}
					}
					o.tabMoveFix(o, 0);
					o.sn = 1;
					o.tn = o.temptn
				}
			}
		},
		fixMoveTo: function(n) {
			var o = this,
			n,
			go;
			o.runId && clearTimeout(o.runId); (n > this.levels - 1) && (n = 0); (n < 0) && (n = this.levels - 1);
			if (this.opt.effect == "slide" || this.opt.effect == "fxslide" || this.opt.effect == "scroll") {
				o.to = "-" + n * this.ml;
				this.end = 0
			} else {
				if (this.opt.effect == "fade") {
					if (!o.opt.pageBt) {
						o.tabs.opacity(0.5);
						o.tabs.item(n).opacity(1)
					}
					o.opt.auto && (o.runId = setTimeout(function() {
						o.next()
					},
					o.opt.interval))
				}
			}
			K.A.each(this.levels,
			function(i) {
				if (n == i) {
					o.tabs.item(i).addClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).addClass(o.opt.curCn)
					}
				} else {
					o.tabs.item(i).removeClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).removeClass(o.opt.curCn)
					}
				}
			});
			this.current = n;
			if (o.opt.numId && o.opt.totalId) {
				K(o.opt.numId).html(this.current + 1)
			}
			this.effectFn(this, n, o.to)
		},
		moveTo: function(n) {
			var o = this,
			n,
			go;
			o.runId && clearTimeout(o.runId); (n > this.levels - 1) && (n = 0); (n < 0) && (n = this.levels - 1);
			if (o.tabwr) {
				if (n == o.shownum) {
					if (o.sn == o.tn) {
						o.sn = 1;
						o.tn = o.temptn;
						o.y = 0;
						o.tabnext(o)
					} else {
						o.tabnext(o)
					}
				} else {
					if (n == 0) {
						if (o.opt.effect == "def") {
							K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
						} else {
							if (o.opt.effect == "slide" || o.opt.effect == "fxslide" || o.opt.effect == "fade") {
								o.effects.tabscroll(o, n, 0)
							} else {
								K(o.opt.id).find(o.tabwr).item(0).scrollLeft(0)
							}
						}
					}
				}
			}
			if (this.opt.effect == "slide" || this.opt.effect == "fxslide" || this.opt.effect == "scroll") {
				o.to = "-" + n * this.ml;
				this.end = 0
			} else {
				if (this.opt.effect == "fade") {
					if (!o.opt.pageBt) {
						o.tabs.opacity(0.5);
						o.tabs.item(n).opacity(1)
					}
					o.opt.auto && (o.runId = setTimeout(function() {
						o.next()
					},
					o.opt.interval))
				}
			}
			K.A.each(this.levels,
			function(i) {
				if (n == i) {
					o.tabs.item(i).addClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).addClass(o.opt.curCn)
					}
				} else {
					o.tabs.item(i).removeClass(o.opt.curCn);
					if (o.texts) {
						o.texts.item(i).removeClass(o.opt.curCn)
					}
				}
			});
			this.current = n;
			if (o.opt.numId && o.opt.totalId) {
				K(o.opt.numId).html(this.current + 1)
			}
			this.effectFn(this, n, o.to)
		},
		scrTo: function(n) {
			var o = this;
			this.runId && clearTimeout(this.runId);
			var o = this,
			n;
			o.to = "-" + n * this.ml;
			this.current = n;
			this.effectFn(this, n, o.to)
		},
		scrprev: function() {
			this.scrTo(--this.current)
		},
		scrnext: function() {
			this.scrTo(++this.current)
		},
		prev: function() {
			this.th2 = 1;
			this.moveTo(--this.current)
		},
		next: function() {
			this.th2 = 1;
			this.moveTo(++this.current)
		},
		tcTime: function() {
			this.simuId && clearTimeout(this.simuId);
			this.th2 = 1;
			this.simulate(this)
		},
		simulate: function(o) {
			o.simuId = setTimeout(function() {
				o.tcTime()
			},
			1000)
		}
	});
	K.tabs = function(options) {
		return new tabs(options)
	};
	K.P.childWrap=function(string,num){
		return Koala.each(function (obj) {
			if(num){obj=obj.child(num);}
			var objIner=obj.html();		
			obj.empty();
			obj.html(string);
			var lastP=obj.node;
			while(lastP.firstChild){
				lastP=lastP.firstChild;
			}
			lastP.innerHTML=objIner;		
        }, this)
		
	};
	//扩展一个 parentWrap, childWrap;
	var scroll = KClass.create({
		init: function(options) {
			this.opt = {
				id: "scroll",
				Speed: 10,
				Space: 10,
				eType: "click",
				effect: "scroll",
				scWr:'.scwr',
				scrElem: "li",
				scrNum: 1,
				showNum: 4,
				auto: 1,
				vertical: "left",
				loop: false,
				interval: 2000
			};
			K.extend(this.opt, options);
			var o = this;
			var opt = this.opt;
			this.Speed = opt.Speed;
			this.Space = -opt.Space;
			this.loop = opt.loop;
			this.showNum = opt.showNum;
			this.vertical = opt.vertical;
			this.interval = opt.interval;
			this.scrElem = opt.scrElem;
			this.prevMouseImg = opt.prevMouseClass;
			this.prevStopImg = opt.prevStopClass;
			this.nextMouseImg = opt.nextMouseClass;
			this.nextStopImg = opt.nextStopClass;
			o.scWr = K(opt.id).find(o.opt.scWr).item(0);
			if(opt.vertical=='left'){
				o.scWr.childWrap("<div class='cols' style='position:absolute;width:9999px'><div class='count' style='overflow:hidden;float:left'></div></div>");
			}else{
				o.scWr.childWrap("<div class='cols' style='position:absolute;height:9999px'><div class='count' style='overflow:hidden;float:left'></div></div>");				
			}
			o.fill = 0;
			o.Comp = 0;
			o.Stop = 0;
			o.test = 0;
			o.finish = 0;
			o.fMoveX = 0;
			o.scrObj = K(opt.id).find(".cols").item(0);
			o.MoveLock = false;
			o.MoveTimeObj = null;
			o.AutoPlayObj = null;
			o.scrEvent1 = null;
			o.btMouse1 = null;
			o.ptMouse1 = null;
			o.scrWrap = o.scrObj.find('.count').item(0);
			o.Wrapchild = o.scrWrap.child(0);
			o.scrlen = o.scrWrap.find(o.scrElem).len;
			o.scrWrap2 = o.scrWrap.clone(true);
			o.scrWrap.parent(1).append(o.scrWrap2);
			if (K.B.ie) {
				if (o.vertical == "left") {
					if (parseInt(o.Wrapchild.css("margin-right")) && !parseInt(o.Wrapchild.css("margin-left"))) {
						this.elemLength = o.Wrapchild.node.offsetWidth + parseInt(o.Wrapchild.css("margin-right"))
					}
					if (parseInt(o.Wrapchild.css("margin-left")) && !parseInt(o.Wrapchild.css("margin-right"))) {
						this.elemLength = o.Wrapchild.node.offsetWidth + parseInt(o.Wrapchild.css("margin-left"))
					}
					if (parseInt(o.Wrapchild.css("margin-right")) && parseInt(o.Wrapchild.css("margin-left"))) {
						this.elemLength = o.Wrapchild.node.offsetWidth + parseInt(o.Wrapchild.css("margin-left")) + parseInt(o.Wrapchild.css("margin-right"))
					}
					if (!parseInt(o.Wrapchild.css("margin-right")) && !parseInt(o.Wrapchild.css("margin-left"))) {
						this.elemLength = o.Wrapchild.node.offsetWidth
					}
				} else {
					if (parseInt(o.Wrapchild.css("margin-bottom")) && !parseInt(o.Wrapchild.css("margin-top"))) {
						this.elemLength = o.Wrapchild.node.offsetHeight + parseInt(o.Wrapchild.css("margin-bottom"))
					}
					if (parseInt(o.Wrapchild.css("margin-top")) && !parseInt(o.Wrapchild.css("margin-bottom"))) {
						this.elemLength = o.Wrapchild.node.offsetHeight + parseInt(o.Wrapchild.css("margin-top"))
					}
					if (parseInt(o.Wrapchild.css("margin-bottom")) && parseInt(o.Wrapchild.css("margin-top"))) {
						this.elemLength = o.Wrapchild.node.offsetHeight + parseInt(o.Wrapchild.css("margin-top")) + parseInt(o.Wrapchild.css("margin-bottom"))
					}
					if (!parseInt(o.Wrapchild.css("margin-bottom")) && !parseInt(o.Wrapchild.css("margin-top"))) {
						this.elemLength = o.Wrapchild.node.offsetHeight
					}
				}
			} else {
				o.vertical == "left" ? this.elemLength = o.Wrapchild.node.offsetWidth + parseInt(o.Wrapchild.css("margin-right")) + parseInt(o.Wrapchild.css("margin-left")) : this.elemLength = o.Wrapchild.node.offsetHeight + parseInt(o.Wrapchild.css("margin-bottom")) + parseInt(o.Wrapchild.css("margin-top"))
			}
			this.PageWidth = this.elemLength * opt.scrNum;
			this.finalMovePos = this.elemLength * (o.scrlen - o.showNum);
			o.scrWrapWidth = o.scrWrap.width();
			o.scrWrapHeight = o.scrWrap.height();
			o.scrObj.hover(function() {
				clearInterval(o.AutoPlayObj)
			},
			function() {
				opt.auto && o.AutoPlay(o)
			});
			if (opt.bns && opt.bns.length == 2) {
				o.btleft = K(opt.id).find(opt.bns[0]).item(0);
				o.btright = K(opt.id).find(opt.bns[1]).item(0);
				o.btnLeftImg = o.btleft.classNames();
				o.btnRightImg = o.btright.classNames();
				o.scrEvent1 = o.btleft.bind("_mousedown",
				function() {
					o.ISL_GoUp(o)
				});
				o.btMouse1 = o.btleft.bind("_mouseover",
				function() {
					this.toggleClass(o.prevMouseImg);
					clearInterval(o.AutoPlayObj)
				});
				o.mouseup1 = o.btleft.bind("_mouseup",
				function() {
					o.ISL_StopUp(o);
					clearInterval(o.AutoPlayObj)
				});
				o.ptMouse1 = o.btleft.bind("_mouseout",
				function() {
					this.toggleClass(o.prevMouseImg);
					opt.auto && o.AutoPlay(o)
				});
				o.btMouse2 = o.btright.bind("_mouseover",
				function() {
					this.toggleClass(o.nextMouseImg);
					clearInterval(o.AutoPlayObj)
				});
				o.scrEvent2 = o.btright.bind("_mousedown",
				function() {
					o.ISL_GoDown(o);
					o.test = 1
				});
				o.mouseup2 = o.btright.bind("_mouseup",
				function() {
					o.ISL_StopDown(o);
					clearInterval(o.AutoPlayObj)
				});
				o.ptMouse2 = o.btright.bind("_mouseout",
				function() {
					this.removeClass(o.nextMouseImg);
					opt.auto && o.AutoPlay(o)
				}); ! o.loop && o.btleft.toggleClass(o.prevStopImg)
			}
			opt.auto && o.AutoPlay(o)
		},
		leftEvent: function(o) {
			o.scrEvent1 = o.btleft.bind("_mousedown",
			function() {
				o.ISL_GoUp(o)
			});
			o.btMouse1 = o.btleft.bind("_mouseover",
			function() {
				this.toggleClass(o.prevMouseImg);
				clearInterval(o.AutoPlayObj)
			});
			o.mouseup1 = o.btleft.bind("_mouseup",
			function() {
				o.ISL_StopUp(o);
				clearInterval(o.AutoPlayObj)
			});
			o.ptMouse1 = o.btleft.bind("_mouseout",
			function() {
				this.toggleClass(o.prevMouseImg);
				opt.auto && o.AutoPlay(o)
			})
		},
		rightEvent: function(o) {
			o.ISL_GoDown(o);
			o.test = 1;
			this.toggleClass(o.nextMouseImg);
			clearInterval(o.AutoPlayObj);
			o.mouseup2 = o.btright.bind("touchend",
			function() {
				o.ISL_StopDown(o);
				clearInterval(o.AutoPlayObj)
			});
			this.removeClass(o.nextMouseImg);
			opt.auto && o.AutoPlay(o)
		},
		linkTo: function(el) {
			if (this.opt.ipNewPage) {
				window.open(el.parent().node.href, "_blank")
			} else {
				window.location.href = el.parent().node.href
			}
		},
		tochStart: function(e, el) {
			e.stopImmediatePropagation();
			e.preventDefault();
			this.runId && clearTimeout(this.runId);
			if (e.targetTouches.length > 1) {
				this.oneFinger = false;
				return
			} else {
				this.oneFinger = true
			}
			this.fMoveX = e.changedTouches[0].pageX
		},
		tochEnd: function(e, el) {
			if (!this.oneFinger) {
				return
			}
			if (this.fMoveX < e.changedTouches[0].pageX) {
				this.leftEvent(this)
			} else {
				if (this.fMoveX > e.changedTouches[0].pageX) {
					this.rightEvent(this)
				} else {
					return this.linkTo(el)
				}
			}
		},
		disbtleft: function(o) {
			o.btleft.unbind("mouseover", o.btMouse1);
			o.btleft.unbind("mouseout", o.ptMouse1);
			o.btleft.unbind("mouseup", o.mouseup1);
			o.btleft.unbind("mousedown", o.scrEvent1);
			o.btleft.removeClass(o.prevMouseImg).addClass(o.prevStopImg)
		},
		disbtright: function(o) {
			o.btright.unbind("mousedown", o.scrEvent2);
			o.btright.unbind("mouseup", o.mouseup2);
			o.btright.unbind("mouseover", o.btMouse2);
			o.btright.unbind("mouseout", o.ptMouse2);
			o.btright.removeClass(o.nextMouseImg).addClass(o.nextStopImg)
		},
		enabbtleft: function(o) {
			if (o.scrEvent1 || o.btMouse1 || o.ptMouse1) {
				o.disbtleft(o);
				o.btleft.removeClass(o.prevStopImg)
			}
			o.scrEvent1 = o.btleft.bind("_mousedown",
			function() {
				o.ISL_GoUp(o)
			});
			o.btMouse1 = o.btleft.bind("_mouseover",
			function() {
				this.toggleClass(o.prevMouseImg);
				clearInterval(o.AutoPlayObj)
			});
			o.mouseup1 = o.btleft.bind("_mouseup",
			function() {
				o.ISL_StopUp(o);
				clearInterval(o.AutoPlayObj)
			});
			o.ptMouse1 = o.btleft.bind("_mouseout",
			function() {
				this.removeClass(o.prevMouseImg);
				o.opt.auto && o.AutoPlay(o)
			});
			o.MoveLock = false
		},
		enabbtright: function(o) {
			if (o.scrEvent2 || o.btMouse2 || o.ptMouse2) {
				o.disbtright(o);
				o.btright.removeClass(o.nextStopImg)
			}
			o.btMouse2 = o.btright.bind("_mouseover",
			function() {
				this.toggleClass(o.nextMouseImg);
				clearInterval(o.AutoPlayObj)
			});
			o.scrEvent2 = o.btright.bind("_mousedown",
			function() {
				o.ISL_GoDown(o)
			});
			o.mouseup2 = o.btright.bind("_mouseup",
			function() {
				o.ISL_StopDown(o)
			});
			o.ptMouse2 = o.btright.bind("_mouseout",
			function() {
				this.removeClass(o.nextMouseImg);
				o.opt.auto && o.AutoPlay(o)
			});
			o.MoveLock = false
		},
		AutoPlay: function(o) {
			clearInterval(o.AutoPlayObj);
			if (o.finish && !o.loop) {
				return
			}
			o.AutoPlayObj = setInterval(function() {
				o.ISL_GoDown(o);
				o.ISL_StopDown(o)
			},
			o.interval)
		},
		ISL_GoDown: function(o) { ! o.loop && o.enabbtleft(o);
			clearInterval(o.MoveTimeObj);
			if (o.MoveLock) {
				return
			}
			clearInterval(o.AutoPlayObj);
			o.ISL_ScrDown(o);
			o.MoveTimeObj = setInterval(function() {
				o.ISL_ScrDown(o)
			},
			o.Speed);
			o.MoveLock = true
		},
		ISL_GoUp: function(o) { ! o.loop && o.enabbtright(o);
			clearInterval(o.MoveTimeObj);
			if (o.MoveLock) {
				return
			}
			o.AutoPlayObj && clearInterval(o.AutoPlayObj);
			o.MoveTimeObj = setInterval(function() {
				o.ISL_ScrUp(o)
			},
			o.Speed);
			o.MoveLock = true;
			o.finish = 0
		},
		ISL_StopUp: function(o) {
			clearInterval(o.MoveTimeObj);
			if (o.vertical == "left") {
				if (o.scrObj.Left() % o.PageWidth - o.fill != 0) {
					o.Comp = o.fill - (o.scrObj.Left() % o.PageWidth);
					o.CompScr(o)
				} else {
					o.MoveLock = false
				}
			} else {
				if (o.scrObj.Top() % o.PageWidth - o.fill != 0) {
					o.Comp = o.fill - (o.scrObj.Top() % o.PageWidth);
					o.CompScr(o)
				} else {
					o.MoveLock = false
				}
			}
			o.opt.auto && o.AutoPlay(o)
		},
		ISL_ScrUp: function(o) {
			if (o.vertical == "left") {
				if ( - o.scrObj.Left() <= 0) {
					if (!o.loop) {
						return
					}
					o.scrObj.Left(o.scrObj.Left() - o.scrWrapWidth)
				}
				if ( - o.scrObj.Left() <= o.PageWidth) { ! o.loop && o.disbtleft(o); ! o.loop && o.opt.auto && setTimeout(function() {
						o.AutoPlay(o)
					},
					o.interval)
				}
				o.scrObj.Left(o.scrObj.Left() - o.Space)
			} else {
				if ( - o.scrObj.Top() <= 0) {
					if (!o.loop) {
						return
					}
					o.scrObj.Top(o.scrObj.Top() - o.scrWrapHeight)
				}
				if ( - o.scrObj.Top() <= o.PageWidth) { ! o.loop && o.disbtleft(o); ! o.loop && o.opt.auto && setTimeout(function() {
						o.AutoPlay(o)
					},
					o.interval)
				}
				o.scrObj.Top(o.scrObj.Top() - o.Space)
			}
		},
		ISL_ScrDown: function(o) {
			if (o.vertical == "left") {
				if (!o.loop && -o.scrObj.Left() > o.finalMovePos) {
					o.disbtright(o);
					o.Stop = 1;
					return
				}
				if (o.scrObj.Left() <= -o.scrWrapWidth) {
					o.scrObj.Left(o.scrObj.Left() + o.scrWrapWidth)
				}
				o.scrObj.Left(o.scrObj.Left() + o.Space);
				if (!o.loop && -o.scrObj.Left() > o.finalMovePos - o.PageWidth) {
					o.disbtright(o);
					o.Stop = 1;
					o.finish = 1
				}
			} else {
				if (!o.loop && -o.scrObj.Top() > o.finalMovePos) {
					o.disbtright(o);
					o.Stop = 1;
					return
				}
				if (o.scrObj.Top() <= -o.scrWrapHeight) {
					o.scrObj.Top(o.scrObj.Top() + o.scrWrapHeight)
				}
				o.scrObj.Top(o.scrObj.Top() + o.Space);
				if (!o.loop && -o.scrObj.Top() > o.finalMovePos - o.PageWidth) {
					o.disbtright(o);
					o.Stop = 1;
					o.finish = 1
				}
			}
		},
		ISL_StopDown: function(o) {
			clearInterval(o.MoveTimeObj);
			if (o.vertical == "left") {
				if (!o.loop && o.Stop && -o.scrObj.Left() > o.finalMovePos - o.PageWidth) {
					setTimeout(function() {
						clearInterval(o.AutoPlayObj)
					},
					o.interval);
					o.MoveLock = false;
					o.Stop = 0;
					o.finish = 1
				}
				if (o.scrObj.Left() % o.PageWidth - o.fill != 0) {
					o.Comp = 0 - o.PageWidth - o.scrObj.Left() % o.PageWidth + o.fill;
					o.CompScr(o)
				} else {
					o.MoveLock = false
				}
			} else {
				if (!o.loop && o.Stop && -o.scrObj.Top() > o.finalMovePos - o.PageWidth) {
					setTimeout(function() {
						clearInterval(o.AutoPlayObj)
					},
					o.interval);
					o.MoveLock = false;
					o.Stop = 0;
					o.finish = 1
				}
				if (o.scrObj.Top() % o.PageWidth - o.fill != 0) {
					o.Comp = 0 - o.PageWidth - o.scrObj.Top() % o.PageWidth + o.fill;
					o.CompScr(o)
				} else {
					o.MoveLock = false
				}
			}
			if (o.test) {
				o.test = 0;
				return
			} else {
				o.opt.auto && o.AutoPlay(o)
			}
		},
		CompScr: function(o) {
			var num;
			if (o.Comp == 0) {
				o.MoveLock = false;
				return
			}
			if (o.Comp > 0) {
				if (o.Comp > -o.Space) {
					o.Comp += o.Space;
					num = o.Space
				} else {
					num = -o.Comp;
					o.Comp = 0
				}
				if (o.vertical == "left") {
					o.scrObj.Left(o.scrObj.Left() - num)
				} else {
					o.scrObj.Top(o.scrObj.Top() - num)
				}
				setTimeout(function() {
					o.CompScr(o)
				},
				o.Speed)
			} else {
				if (o.Comp < o.Space) {
					o.Comp -= o.Space;
					num = o.Space
				} else {
					num = o.Comp;
					o.Comp = 0
				}
				if (o.vertical == "left") {
					o.scrObj.Left(o.scrObj.Left() + num)
				} else {
					o.scrObj.Top(o.scrObj.Top() + num)
				}
				setTimeout(function() {
					o.CompScr(o)
				},
				o.Speed)
			}
		}
	});
	K.scroll = function(options) {
		return new scroll(options)
	};
	function parseHtmlStr(str) {
		var nd = document.createElement(/<\w+/.exec(str)[0].substr(1)),
		atts = str.substr(0, str.indexOf(">") + 1).match(/\w+=(['"])[^>]*?\1/g);
		if (atts && atts.length > 0) {
			var i = 0;
			while (atts[i]) {
				var tmp = atts[i].split("=");
				if (tmp[1] = tmp[1].replace(/['"]/g, "")) {
					nd.setAttribute(tmp[0], tmp[1])
				}
				i++
			}
		}
		nd.innerHTML = str.substring(str.indexOf(">") + 1, str.lastIndexOf("<")).replace(/^\s+|\s+$/g, "");
		return nd
	}
	function setOpacity(elem, level) {
		if (elem.filters) {
			elem.style.filter = "alpha(opacity=" + level + ")"
		} else {
			elem.style.opacity = level / 100
		}
	}
})(Koala);
