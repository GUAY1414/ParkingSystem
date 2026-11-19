import Link from "next/link";
import { ArrowRight, CarFront, MapPin, QrCode, ShieldCheck } from "lucide-react";

const features = [
	{
		icon: CarFront,
		title: "Vehicle verification",
		text: "Register vehicles and scan plates with OCR-assisted identification.",
	},
	{
		icon: MapPin,
		title: "Live parking map",
		text: "Find participating locations, zones, fixed rates, and availability.",
	},
	{
		icon: QrCode,
		title: "Secure sessions",
		text: "Attendants issue unique QR references for fast, authorized retrieval.",
	},
	{
		icon: ShieldCheck,
		title: "Reliable records",
		text: "Track payments, receipts, transactions, and audit activity.",
	},
];

export default function Home() {
	return (
		<main className="landing-shell">
			<nav className="nav-bar">
				<Link href="/" className="brand">
					<span className="brand-mark">
						<CarFront size={19} />
					</span>
					<span>
						<strong>Kuya meron pa?</strong>
						<small>Digital Parking Manila</small>
					</span>
				</Link>
				<div className="nav-actions">
					<Link href="/register" className="secondary-button">
						Register
					</Link>
					<Link href="/login" className="primary-button">
						Log In <ArrowRight size={16} />
					</Link>
				</div>
			</nav>

			<section className="hero">
				<div className="hero-copy">
					<div className="eyebrow">
						<span /> Connected parking made simple
					</div>
					<h1>
						Find a place to park.
						<br />
						<em>Without the guesswork.</em>
					</h1>
					<p>
						One platform for drivers, authorized attendants, and parking
						administrators across Manila.
					</p>
					<div className="hero-actions">
						<Link href="/register" className="primary-button large">
							Register <ArrowRight size={18} />
						</Link>
						<Link href="/login" className="secondary-button large">
							Log In
						</Link>
					</div>
					<div className="trust-row">
						<span>
							<b>4</b> user roles
						</span>
						<span>
							<b>Secure</b> QR sessions
						</span>
						<span>
							<b>Verified</b> payments
						</span>
					</div>
				</div>

				<div
					className="hero-visual"
					aria-label="Parking dashboard preview"
				>
					<div className="phone-card">
						<div className="phone-head">
							<span>Good morning</span>
							<span className="avatar">DR</span>
						</div>
						<div className="status-card">
							<div>
								<small>ACTIVE SESSION</small>
								<strong>Manila • Zone A</strong>
							</div>
							<span className="status-pill">Active</span>
							<div className="plate">NMP 2048</div>
							<div className="session-meta">
								<span>Started 08:42 AM</span>
								<span>₱50 fixed rate</span>
							</div>
						</div>
						<div className="quick-grid">
							<div>
								<MapPin size={18} />
								<span>Find parking</span>
							</div>
							<div>
								<CarFront size={18} />
								<span>My vehicles</span>
							</div>
							<div>
								<QrCode size={18} />
								<span>Session QR</span>
							</div>
						</div>
					</div>
					<div className="map-card">
						<div className="map-lines" />
						<span className="map-pin pin-one">
							<MapPin size={16} />
						</span>
						<span className="map-pin pin-two">
							<MapPin size={16} />
						</span>
						<span className="map-pin pin-three">
							<MapPin size={16} />
						</span>
						<div className="map-label">
							<strong>Zone A</strong>
							<span>12 available</span>
						</div>
					</div>
				</div>
			</section>

			<section className="feature-section">
				<div className="section-heading">
					<span>Platform features</span>
					<h2>Everything needed to manage parking.</h2>
				</div>
				<div className="feature-grid">
					{features.map(({ icon: Icon, title, text }) => (
						<article
							key={title}
							className="feature-card"
						>
							<span>
								<Icon size={21} />
							</span>
							<h3>{title}</h3>
							<p>{text}</p>
						</article>
					))}
				</div>
			</section>
		</main>
	);
}
