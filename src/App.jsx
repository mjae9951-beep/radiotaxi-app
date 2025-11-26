import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Save, Trash2, Printer, Car, Calendar, DollarSign, MapPin, 
  User, Clock, FileText, PieChart, Edit, X, ArrowUpDown, Loader, 
  Bell, AlertCircle, CheckCircle, Clock3, Crown, ChevronRight, Search,
  Settings, Download, Upload, BarChart3, LayoutDashboard, TrendingUp,
  LogIn, LogOut, ShieldCheck, CalendarDays, Phone, AlertTriangle, ExternalLink,
  UserCircle, Cloud, Book, FolderOpen
} from 'lucide-react';

// --- IMPORTACIONES FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, where, deleteDoc, doc, updateDoc, getDocs, writeBatch, orderBy 
} from "firebase/firestore";
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken,
  GoogleAuthProvider, signInWithPopup, signOut, linkWithPopup
} from "firebase/auth";

// ------------------------------------------------------------------
// TUS CREDENCIALES REALES (YA INTEGRADAS)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCL87J3HLV0YoxwLRu-F3364_KGiQKd1Ys",
  authDomain: "central-radiotaxi.firebaseapp.com",
  projectId: "central-radiotaxi",
  storageBucket: "central-radiotaxi.firebasestorage.app",
  messagingSenderId: "270388914410",
  appId: "1:270388914410:web:9704b7782995d23bec0f93"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'radiotaxi-central-v1'; 

// --- PANTALLA DE LOGIN (ESTILO APPLE) ---
const LoginScreen = ({ onLoginGoogle, onLoginGuest, error }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans selection:bg-yellow-100 animate-in fade-in duration-700">
       <style>{`
         @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
         .animate-float { animation: float 6s ease-in-out infinite; }
       `}</style>
       <div className="lg:w-1/2 bg-black text-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-black to-black opacity-60"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="p-6 bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl mb-8 border border-white/10 animate-float">
                <Car className="w-24 h-24 text-yellow-400" strokeWidth={1.5} />
             </div>
             <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6">Central<span className="text-yellow-400">Radiotaxi</span></h1>
             <p className="text-zinc-400 text-lg max-w-md leading-relaxed">Sistema integral para el control de flota, gestión de reservas y finanzas en tiempo real.</p>
             <div className="mt-12 flex gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div><div className="w-2 h-2 rounded-full bg-zinc-700"></div><div className="w-2 h-2 rounded-full bg-zinc-700"></div></div>
          </div>
       </div>
       <div className="lg:w-1/2 bg-[#F5F5F7] flex flex-col justify-center items-center p-8 lg:p-24">
          <div className="w-full max-w-md">
             <div className="mb-10"><h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Bienvenido</h2><p className="text-slate-500">Selecciona cómo deseas ingresar al panel de control.</p></div>
             {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /><div><h4 className="text-sm font-bold text-red-700">Aviso del Sistema</h4><p className="text-xs text-red-600 mt-1">{error}</p></div></div>}
             <div className="space-y-4">
                <button onClick={onLoginGoogle} className="w-full group relative flex items-center p-1 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"><Cloud className="w-6 h-6" /></div>
                  <div className="flex-1 py-3 pr-4 text-left"><h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">Ingresar con Google</h3><p className="text-xs text-slate-400 mt-0.5">Datos seguros en la nube.</p></div>
                  <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"><ChevronRight className="w-5 h-5 text-blue-500" /></div>
                </button>
                <button onClick={onLoginGuest} className="w-full group relative flex items-center p-1 bg-white border border-gray-200 rounded-2xl hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300">
                  <div className="p-4 bg-orange-50 text-orange-600 rounded-xl mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300"><UserCircle className="w-6 h-6" /></div>
                  <div className="flex-1 py-3 pr-4 text-left"><h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-700 transition-colors">Modo Invitado</h3><p className="text-xs text-slate-400 mt-0.5">Acceso rápido (Datos temporales).</p></div>
                  <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300"><ChevronRight className="w-5 h-5 text-orange-500" /></div>
                </button>
             </div>
             <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-medium"><span>v3.0 Pro</span><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span></div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENTE GRÁFICO ---
const SimpleBarChart = ({ data, labelKey, valueKey, colorClass = "bg-blue-500", height = 100 }) => {
  if (!data || data.length === 0) return <div className="text-xs text-gray-400 text-center p-4">Sin datos</div>;
  const maxValue = Math.max(...data.map(d => d[valueKey])) || 1;
  return (
    <div className="flex items-end justify-between gap-2 h-full w-full pt-4">
      {data.map((item, idx) => {
        const heightPct = (item[valueKey] / maxValue) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: `${height}px` }}>
               <div style={{ height: `${heightPct}%` }} className={`w-full max-w-[24px] rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-500 ${colorClass}`}></div>
               <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">{item[valueKey]}</div>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-2 truncate w-full text-center">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function RadioTaxiApp() {
  // --- ESTADOS ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Vistas: 'daily', 'stats', 'books'
  const [currentView, setCurrentView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortOrder, setSortOrder] = useState('creation');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Refs de Formulario
  const movilRef = useRef(null);
  const horaRef = useRef(null);
  const direccionRef = useRef(null);
  const destinoRef = useRef(null);
  const tarifaRef = useRef(null);
  
  // Datos
  const [dailyTrips, setDailyTrips] = useState([]);
  const [weeklyTrips, setWeeklyTrips] = useState([]);
  const [futureTrips, setFutureTrips] = useState([]); 
  const [booksData, setBooksData] = useState([]); 
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    movil: '',
    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    direccion: '',
    destino: '',
    pasajero: '',
    telefono: '', 
    tarifa: '',
    estado: 'Completado'
  });

  const formatText = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  useEffect(() => {
    if (!editingId) {
        setFormData(prev => ({ ...prev, fecha: currentDate }));
    }
  }, [currentDate, editingId]);

  // --- AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setAuthError(null);
    });
    return () => unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    setLoading(true);
    try { await signInAnonymously(auth); } 
    catch (error) { setAuthError("Error invitado: " + error.message); setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (user && user.isAnonymous) {
          await linkWithPopup(user, provider);
          alert("¡Sincronización exitosa! Datos guardados.");
      } else {
          await signInWithPopup(auth, provider);
      }
      setShowUserMenu(false);
    } catch (error) {
      if (error.code === 'auth/credential-already-in-use') {
         if(confirm("Esa cuenta ya existe y tiene datos guardados. ¿Cambiar a ella?")) await signInWithPopup(auth, provider);
      } else {
          alert("Error conexión Google: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("¿Cerrar sesión?")) { await signOut(auth); setShowUserMenu(false); setUser(null); }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    
    // Vista DIARIO
    if (currentView === 'daily') {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), where('fecha', '==', currentDate));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setDailyTrips(data);
        }, (e) => { if(e.code === 'permission-denied') setAuthError("Permiso denegado. Revisa reglas Firebase."); });
        return () => unsub();
    }
    
    // Vista ESTADÍSTICAS
    if (currentView === 'stats') {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), where('fecha', 'in', dates));
        const unsub = onSnapshot(q, (snap) => {
            setWeeklyTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }

    // Vista LIBROS
    if (currentView === 'books') {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), orderBy('fecha', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const all = snap.docs.map(d => d.data());
            const grouped = all.reduce((acc, t) => {
                if (!acc[t.fecha]) acc[t.fecha] = { date: t.fecha, total: 0, count: 0 };
                if (t.estado === 'Completado') {
                    acc[t.fecha].total += (t.tarifa || 0);
                    acc[t.fecha].count += 1;
                }
                return acc;
            }, {});
            setBooksData(Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)));
        });
        return () => unsub();
    }
  }, [user, currentDate, currentView]);

  // Fetch Futuras
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'));
    const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const future = all.filter(t => t.fecha > new Date().toISOString().split('T')[0] && t.estado === 'Agendado');
        future.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
        setFutureTrips(future);
    });
    return () => unsub();
  }, [user]);

  // --- COMPUTED DATA ---
  const stats = useMemo(() => {
    if (!weeklyTrips.length) return null;
    const totalIncome = weeklyTrips.reduce((sum, t) => t.estado === 'Completado' ? sum + (t.tarifa || 0) : sum, 0);
    const totalTrips = weeklyTrips.filter(t => t.estado === 'Completado').length;
    
    const tripsByDay = {};
    const daysLabels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' });
        tripsByDay[dateStr] = { label, count: 0 };
        daysLabels.push(dateStr);
    }
    weeklyTrips.forEach(t => { if (t.estado === 'Completado' && tripsByDay[t.fecha]) tripsByDay[t.fecha].count += 1; });
    const chartDataDaily = daysLabels.map(date => ({ day: tripsByDay[date].label, trips: tripsByDay[date].count }));
    
    const hoursMap = new Array(24).fill(0);
    weeklyTrips.forEach(t => { if (t.hora && t.estado === 'Completado') { const h = parseInt(t.hora.split(':')[0]); if (!isNaN(h)) hoursMap[h]++; } });
    const chartDataHours = hoursMap.map((c, h) => ({ hour: `${h}:00`, count: c })).filter(h => h.count > 0);
    
    const driversMap = {};
    weeklyTrips.forEach(t => {
        if (t.estado === 'Completado' && t.movil !== '---') {
            if (!driversMap[t.movil]) driversMap[t.movil] = { id: t.movil, income: 0, trips: 0 };
            driversMap[t.movil].income += t.tarifa;
            driversMap[t.movil].trips += 1;
        }
    });
    const topDrivers = Object.values(driversMap).sort((a, b) => b.income - a.income).slice(0, 5);

    const customersMap = {};
    weeklyTrips.forEach(t => {
        if (t.estado === 'Completado' && t.telefono) {
            const phone = t.telefono.trim();
            if (phone) {
                if (!customersMap[phone]) customersMap[phone] = { phone, name: t.pasajero || 'Anónimo', trips: 0 };
                customersMap[phone].trips += 1;
                if (t.pasajero) customersMap[phone].name = t.pasajero;
            }
        }
    });
    const topCustomers = Object.values(customersMap).sort((a, b) => b.trips - a.trips).slice(0, 5);

    return { totalIncome, totalTrips, chartDataDaily, chartDataHours, topDrivers, topCustomers };
  }, [weeklyTrips]);

  const processedDailyTrips = useMemo(() => {
    let list = [...dailyTrips];
    if (sortOrder === 'time') list.sort((a, b) => a.hora.localeCompare(b.hora));
    else list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [dailyTrips, sortOrder]);

  const agendaItemsToday = useMemo(() => dailyTrips.filter(t => t.estado === 'Agendado' || t.estado === 'Pendiente').sort((a,b)=>a.hora.localeCompare(b.hora)), [dailyTrips]);
  
  const driverDailySummary = useMemo(() => {
    const summary = {};
    dailyTrips.forEach(trip => {
      if (trip.estado === 'Completado' && trip.tarifa > 0 && trip.movil !== '---') {
        if (!summary[trip.movil]) summary[trip.movil] = { total: 0, count: 0 };
        summary[trip.movil].total += trip.tarifa;
        summary[trip.movil].count += 1;
      }
    });
    return Object.entries(summary).map(([movil, data]) => {
      const isOwner = movil.toString() === '6';
      const commission = isOwner ? data.total : data.total * 0.20;
      return { movil, ...data, commission, isOwner };
    }).sort((a, b) => parseInt(a.movil) - parseInt(b.movil));
  }, [dailyTrips]);

  const dailyTotal = driverDailySummary.reduce((acc, curr) => acc + curr.total, 0);
  const centralTotal = driverDailySummary.reduce((acc, curr) => acc + curr.commission, 0);

  // --- HANDLERS (Navegación Enter) ---
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.name === 'movil') {
          setFormData(prev => ({ ...prev, hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }));
      }
      
      if (nextFieldRef === 'submit') {
          handleSubmit(e);
      } else if (nextFieldRef?.current) {
          nextFieldRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    if ((formData.estado === 'Completado' || formData.estado === 'Pendiente') && (!formData.movil || !formData.tarifa)) { 
        alert("Asigna Móvil y Tarifa."); return; 
    }
    const tripData = { 
        ...formData,
        direccion: formatText(formData.direccion),
        destino: formatText(formData.destino),
        pasajero: formatText(formData.pasajero),
        tarifa: formData.tarifa ? parseInt(formData.tarifa) : 0, 
        movil: formData.movil || '---', 
        telefono: formData.telefono || '', 
        createdAt: Date.now() 
    };
    try {
      if (editingId) { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', editingId), tripData); setEditingId(null); } 
      else { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), tripData); }
      setFormData({ fecha: currentDate, movil: '', hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), direccion: '', destino: '', pasajero: '', telefono: '', tarifa: '', estado: 'Completado' });
      if (movilRef.current) movilRef.current.focus();
    } catch (error) { console.error(error); }
  };

  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setFormData({ ...trip }); 
    if (currentView === 'stats' || currentView === 'books') setCurrentView('daily');
    if (trip.fecha !== currentDate) setCurrentDate(trip.fecha); 
  };

  const deleteTrip = async (id) => { if (confirm('¿Borrar?')) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id)); if (editingId === id) setEditingId(null); } };

  const cancelEdit = () => {
      setEditingId(null);
      setFormData({ fecha: currentDate, movil: '', hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), direccion: '', destino: '', pasajero: '', telefono: '', tarifa: '', estado: 'Completado' });
  }

  // --- UTILS ---
  const handleExportBackup = async () => {
    if (!user) return;
    try {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'));
        const snap = await getDocs(q);
        const blob = new Blob([JSON.stringify(snap.docs.map(d => ({id:d.id, ...d.data()})), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `Respaldo_RT_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link); setShowSettings(false);
    } catch (e) { alert("Error backup"); }
  };

  const handleImportBackup = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
          setIsRestoring(true);
          try {
              const data = JSON.parse(ev.target.result);
              if (!confirm(`¿Restaurar ${data.length} registros?`)) { setIsRestoring(false); return; }
              const batch = writeBatch(db);
              data.forEach(item => { const {id, ...d} = item; batch.set(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id||String(Date.now())), d); });
              await batch.commit();
              alert("Listo"); setShowSettings(false);
          } catch (err) { alert("Error import"); } finally { setIsRestoring(false); }
      };
      reader.readAsText(file);
  };

  // Carga dinámica de jsPDF
  const loadPdfLibrary = async () => {
    if (window.jspdf && window.jspdf.jsPDF) return;
    return new Promise((resolve) => {
      const scriptMain = document.createElement('script');
      scriptMain.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.body.appendChild(scriptMain);
      scriptMain.onload = () => {
        const scriptTable = document.createElement('script');
        scriptTable.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js";
        document.body.appendChild(scriptTable);
        scriptTable.onload = resolve;
      };
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await loadPdfLibrary();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text(`LIBRO DIARIO - ${currentDate}`, 14, 20);
      doc.autoTable({ startY: 30, head: [['Hora', 'Móvil', 'Dirección', 'Tarifa']], body: processedDailyTrips.map(t => [t.hora, t.movil, t.direccion, t.tarifa]) });
      doc.save(`RT_${currentDate}.pdf`);
    } catch (e) { alert("Error PDF"); } finally { setIsGeneratingPdf(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400 font-light">Cargando...</div>;
  if (!user) return <LoginScreen onLoginGoogle={handleGoogleLogin} onLoginGuest={handleGuestLogin} error={authError} />;

  return (
    <div className="h-screen bg-[#F5F5F7] text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-blue-100 relative animate-in fade-in duration-500">
      <style>{`.custom-scrollbar::-webkit-scrollbar {width:6px;height:6px} .custom-scrollbar::-webkit-scrollbar-track {background:transparent} .custom-scrollbar::-webkit-scrollbar-thumb {background-color:rgba(0,0,0,0);border-radius:10px;transition:background-color 0.3s ease} .custom-scrollbar:hover::-webkit-scrollbar-thumb {background-color:rgba(0,0,0,0.2)} @keyframes grow-up { from { transform: scaleY(0); } to { transform: scaleY(1); } } .animate-grow-up { transform-origin: bottom; animation: grow-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}</style>
      
      {isRestoring && <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center"><Loader className="w-10 h-10 animate-spin text-blue-600"/></div>}

      <header className="flex-none bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><div className="bg-black p-2 rounded-xl shadow-lg"><Car className="text-white w-5 h-5" /></div><div><h1 className="text-lg font-semibold">Control Radiotaxi</h1><div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase"><span className={`w-1.5 h-1.5 rounded-full ${user.isAnonymous?'bg-orange-400':'bg-green-500'}`}></span> {user.isAnonymous?'Invitado':'Conectado'}</div></div></div>
          <div className="flex bg-gray-100/80 p-1 rounded-xl">
            <button onClick={() => setCurrentView('daily')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'daily' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><LayoutDashboard className="w-4 h-4" /> Diario</button>
            <button onClick={() => setCurrentView('stats')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'stats' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><BarChart3 className="w-4 h-4" /> Estadísticas</button>
            <button onClick={() => setCurrentView('books')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'books' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><Book className="w-4 h-4" /> Libros</button>
          </div>
          <div className="flex gap-3 items-center">
            {currentView === 'daily' && (<div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-lg border border-gray-200/50"><Calendar className="w-4 h-4 text-slate-400" /><input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 font-medium text-sm cursor-pointer" /></div>)}
            <button onClick={generatePDF} disabled={isGeneratingPdf} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100 transition-all">{isGeneratingPdf ? <Loader className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}</button>
            <div className="relative"><button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100"><Settings className="w-5 h-5" /></button>{showSettings && <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl p-2 z-50 border border-gray-100"><button onClick={handleExportBackup} className="w-full flex gap-3 p-2.5 hover:bg-blue-50 rounded-xl text-sm text-slate-700"><Download className="w-4 h-4" /> Respaldo</button><button onClick={() => fileInputRef.current?.click()} className="w-full flex gap-3 p-2.5 hover:bg-blue-50 rounded-xl text-sm text-slate-700"><Upload className="w-4 h-4" /> Restaurar</button><input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" /></div>}</div>
            <div className="relative"><button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-gray-100 hover:bg-gray-200">{user.photoURL ? <img src={user.photoURL} className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">{user.isAnonymous ? 'G' : user.email[0].toUpperCase()}</div>}</button>{showUserMenu && <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl p-2 z-50 border border-gray-100"><div className="p-3 border-b border-gray-50"><p className="text-sm font-bold">{user.isAnonymous ? 'Invitado' : user.displayName}</p></div><button onClick={handleLogout} className="w-full flex gap-3 p-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm mt-1"><LogOut className="w-4 h-4" /> Salir</button></div>}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto h-full">
            {currentView === 'daily' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className="lg:col-span-4 xl:col-span-4 h-full overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar p-6 space-y-8">
                        <div className={`relative transition-all ${editingId ? 'bg-blue-50/50 ring-1 ring-blue-100 rounded-3xl p-1 -m-1' : ''}`}>
                            <div className="flex justify-between mb-5 px-1"><h2 className="text-xl font-semibold text-slate-900 flex gap-2">{editingId ? 'Editar' : 'Nuevo Ingreso'}</h2>{editingId && <button onClick={cancelEdit}><X className="w-4 h-4 text-slate-500" /></button>}</div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="bg-gray-50 p-1 rounded-xl flex text-xs font-medium text-slate-500">{['Completado', 'Agendado', 'Pendiente', 'Cancelado'].map((status) => (<button type="button" key={status} onClick={() => setFormData({ ...formData, estado: status })} className={`flex-1 py-2 rounded-lg transition-all ${formData.estado === status ? 'bg-white text-slate-900 shadow-sm' : ''} ${status === 'Cancelado' && formData.estado === status ? 'text-red-600' : ''} ${status === 'Pendiente' && formData.estado === status ? 'text-amber-600' : ''}`}>{status}</button>))}</div>
                                <div className="group"><label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Fecha del Viaje</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center"><CalendarDays className="h-4 w-4 text-slate-400" /></div><input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div></div>
                                <div className="grid grid-cols-2 gap-4"><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Car className="h-4 w-4 text-slate-400" /></div><input ref={movilRef} onKeyDown={(e) => handleKeyDown(e, horaRef)} type="number" name="movil" value={formData.movil} onChange={handleInputChange} placeholder="Móvil" className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div><input ref={horaRef} onKeyDown={(e) => handleKeyDown(e, direccionRef)} type="time" name="hora" value={formData.hora} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
                                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center"><MapPin className="h-4 w-4 text-slate-400" /></div><input ref={direccionRef} onKeyDown={(e) => handleKeyDown(e, destinoRef)} type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección retiro" required className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4"><input ref={destinoRef} onKeyDown={(e) => handleKeyDown(e, tarifaRef)} type="text" name="destino" value={formData.destino} onChange={handleInputChange} placeholder="Destino (Opc)" className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center"><DollarSign className="h-4 w-4 text-green-600" /></div><input ref={tarifaRef} onKeyDown={(e) => handleKeyDown(e, 'submit')} type="number" name="tarifa" value={formData.tarifa} onChange={handleInputChange} placeholder="Tarifa" className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none placeholder-green-700/30" /></div></div>
                                <div className="grid grid-cols-2 gap-4"><input type="text" name="pasajero" value={formData.pasajero} onChange={handleInputChange} placeholder="Pasajero" className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Phone className="h-4 w-4 text-slate-400" /></div><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono" className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" /></div></div>
                                <button type="submit" className={`w-full py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 ${editingId ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}>{editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? 'Guardar' : 'Registrar'}</button>
                            </form>
                        </div>
                        <div><h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> Agenda Hoy <span className="bg-gray-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{agendaItemsToday.length}</span></h3><div className="space-y-3">{agendaItemsToday.length === 0 ? <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-xl">Nada pendiente hoy</p> : agendaItemsToday.map(item => (<div key={item.id} onClick={() => handleEdit(item)} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 cursor-pointer relative overflow-hidden"><div className={`absolute left-0 top-0 bottom-0 w-1 ${item.estado === 'Pendiente' ? 'bg-yellow-400' : 'bg-orange-400'}`}></div><div className="flex justify-between mb-1 pl-2"><div className="flex items-center gap-2"><span className="font-mono font-semibold text-slate-800 bg-gray-50 px-1.5 rounded text-sm">{item.hora}</span>{item.estado === 'Pendiente' && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Por Cobrar</span>}</div><ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" /></div><p className="text-sm font-medium text-slate-700 pl-2 truncate">{item.direccion}</p><div className="pl-2 text-xs text-slate-400 mt-1">{item.pasajero} • {item.movil !== '---' ? `Móvil ${item.movil}` : 'S/A'} {item.estado === 'Pendiente' ? `• $${item.tarifa}` : ''}</div></div>))}</div></div>
                        {futureTrips.length > 0 && (<div><h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2 mt-8"><span className="w-1.5 h-4 bg-purple-500 rounded-full"></span> Próximos Días <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full">{futureTrips.length}</span></h3><div className="space-y-3">{futureTrips.map(item => (<div key={item.id} onClick={() => handleEdit(item)} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 cursor-pointer relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div><div className="flex justify-between mb-1 pl-2 items-center"><span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wide">{new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })}</span><span className="font-mono font-semibold text-slate-500 text-xs">{item.hora}</span></div><p className="text-sm font-medium text-slate-700 pl-2 mt-2">{item.direccion}</p><div className="pl-2 text-xs text-slate-400 mt-1">{item.pasajero}</div></div>))}</div></div>)}
                    </div>
                    <div className="lg:col-span-8 xl:col-span-8 h-full overflow-y-auto bg-[#F5F5F7] p-6 lg:p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"><div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-medium text-slate-400 uppercase mb-1">Total Recaudado (Hoy)</p><h3 className="text-3xl font-bold text-slate-900">${dailyTotal.toLocaleString('es-CL')}</h3></div><div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"><p className="text-xs font-medium text-slate-400 uppercase mb-1">Ganancia Central</p><h3 className="text-3xl font-bold text-blue-600">${centralTotal.toLocaleString('es-CL')}</h3></div></div>
                        <div className="mb-8 overflow-x-auto custom-scrollbar pb-2"><div className="flex gap-3 min-w-max">{driverDailySummary.map(d => (<div key={d.movil} className={`flex flex-col p-4 rounded-2xl border min-w-[160px] ${d.isOwner ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-gray-100'}`}><div className="flex justify-between mb-4"><span className={`text-xs font-bold px-2 py-1 rounded-lg ${d.isOwner ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-slate-600'}`}>Móvil {d.movil}</span>{d.isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}</div><div className="mt-auto"><div className="flex justify-between items-baseline mb-0.5"><p className="text-xs text-slate-400">Recaudado</p><span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">{d.count} viajes</span></div><p className="text-lg font-bold text-slate-900">${d.total.toLocaleString('es-CL')}</p><div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs"><span className="text-slate-400">Base</span><span className={`font-bold ${d.isOwner ? 'text-amber-600' : 'text-blue-600'}`}>${d.commission.toLocaleString('es-CL')}</span></div></div></div>))}</div></div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10"><h3 className="font-bold text-slate-900 text-sm">Movimientos del Día</h3><button onClick={() => setSortOrder(prev => prev === 'time' ? 'creation' : 'time')} className="text-xs font-medium text-slate-500 bg-gray-50 px-3 py-1.5 rounded-lg flex gap-1 items-center hover:bg-gray-100"><ArrowUpDown className="w-3 h-3" /> {sortOrder === 'time' ? 'Por Hora' : 'Por Ingreso'}</button></div>
                            <table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50 border-b border-gray-100"><tr><th className="px-6 py-4">Hora</th><th className="px-6 py-4">Móvil</th><th className="px-6 py-4">Detalle</th><th className="px-6 py-4">Tarifa</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4"></th></tr></thead>
                            <tbody className="divide-y divide-gray-50">{processedDailyTrips.length === 0 ? <tr><td colSpan="6" className="text-center py-12 text-slate-400">Sin registros hoy</td></tr> : processedDailyTrips.map(t => (<tr key={t.id} className="hover:bg-blue-50/30 transition-colors group"><td className="px-6 py-4 font-mono text-slate-500 text-xs">{t.hora}</td><td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${t.movil.toString() === '6' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{t.movil}</span></td><td className="px-6 py-4"><div className="font-medium text-slate-800">{t.direccion}</div><div className="text-xs text-slate-400 mt-0.5">{t.destino && <span>➜ {t.destino}</span>} {t.pasajero && <span>• {t.pasajero}</span>}</div></td><td className="px-6 py-4 font-bold text-slate-900">{t.tarifa > 0 ? `$${t.tarifa.toLocaleString('es-CL')}` : '-'}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${t.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-100' : t.estado === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-100' : t.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{t.estado}</span></td><td className="px-6 py-4 text-right"><div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1"><button onClick={() => handleEdit(t)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => deleteTrip(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></td></tr>))}</tbody></table>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA 3: LIBROS (BOOKS) */}
            {currentView === 'books' && (
                <div className="h-full overflow-y-auto bg-[#F5F5F7] p-6 lg:p-10 custom-scrollbar pb-32">
                    <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Libros Contables</h2><p className="text-slate-500">Historial de registros por fecha</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {booksData.map(book => (
                            <div key={book.date} onClick={() => { setCurrentDate(book.date); setCurrentView('daily'); }} className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="absolute top-0 left-0 w-2 h-full bg-slate-800 group-hover:bg-blue-600 transition-colors"></div>
                                <div className="pl-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{new Date(book.date + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                                    <p className="text-xs text-slate-400 font-mono mb-4">{book.date}</p>
                                    <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                        <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Total</p><p className="text-xl font-bold text-slate-900">${book.total.toLocaleString('es-CL')}</p></div>
                                        <div className="text-right"><p className="text-[10px] text-slate-400 uppercase tracking-wider">Viajes</p><p className="text-lg font-bold text-slate-600">{book.count}</p></div>
                                    </div>
                                </div>
                                <FolderOpen className="absolute top-6 right-6 w-8 h-8 text-gray-100 group-hover:text-blue-50 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VISTA 2: ESTADÍSTICAS */}
            {currentView === 'stats' && (
                <div className="h-full overflow-y-auto bg-[#F5F5F7] p-6 lg:p-10 custom-scrollbar pb-32">
                    <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reporte Semanal</h2><p className="text-slate-500">Resumen de actividad de los últimos 7 días</p></div>
                    {!stats ? <div className="flex justify-center py-20 text-slate-400"><Loader className="w-8 h-8 animate-spin" /></div> : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-50 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div><span className="text-sm font-medium text-slate-500">Ingresos (7 días)</span></div><p className="text-3xl font-bold text-slate-900">${stats.totalIncome.toLocaleString('es-CL')}</p></div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-50 rounded-xl"><Car className="w-5 h-5 text-blue-600" /></div><span className="text-sm font-medium text-slate-500">Total Viajes</span></div><p className="text-3xl font-bold text-slate-900">{stats.totalTrips}</p></div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-50 rounded-xl"><Crown className="w-5 h-5 text-amber-600" /></div><span className="text-sm font-medium text-slate-500">Mejor Móvil</span></div><p className="text-3xl font-bold text-slate-900">{stats.topDrivers[0] ? `Móvil ${stats.topDrivers[0].id}` : '-'}</p>{stats.topDrivers[0] && <p className="text-xs text-slate-400 mt-1">${stats.topDrivers[0].income.toLocaleString('es-CL')} generados</p>}</div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col hover:shadow-md transition-shadow"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Tendencia Semanal</h3><div className="flex-1"><SimpleBarChart data={stats.chartDataDaily} labelKey="day" valueKey="trips" colorClass="bg-slate-800" /></div></div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col hover:shadow-md transition-shadow"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Horas Punta</h3><div className="flex-1"><SimpleBarChart data={stats.chartDataHours} labelKey="hour" valueKey="count" colorClass="bg-blue-500" /></div></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"><div className="p-6 border-b border-gray-100"><h3 className="font-bold text-slate-900">Top Conductores</h3></div><table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Móvil</th><th className="px-6 py-3">Viajes</th><th className="px-6 py-3">Recaudado</th></tr></thead><tbody>{stats.topDrivers.map((d, idx) => (<tr key={d.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50"><td className="px-6 py-4"><span className="font-bold text-slate-300">#{idx + 1}</span></td><td className="px-6 py-4 font-bold text-slate-700">Móvil {d.id}</td><td className="px-6 py-4 text-slate-600">{d.trips}</td><td className="px-6 py-4 font-bold text-green-600">${d.income.toLocaleString('es-CL')}</td></tr>))}</tbody></table></div>
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"><div className="p-6 border-b border-gray-100"><h3 className="font-bold text-slate-900">Clientes Frecuentes</h3></div><table className="w-full text-sm text-left"><thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Teléfono</th><th className="px-6 py-3">Nombre</th><th className="px-6 py-3">Viajes</th></tr></thead><tbody>{stats.topCustomers.map((c, idx) => (<tr key={c.phone} className="border-b border-gray-50 last:border-none hover:bg-gray-50"><td className="px-6 py-4"><span className="font-bold text-slate-300">#{idx + 1}</span></td><td className="px-6 py-4 font-mono text-slate-600">{c.phone}</td><td className="px-6 py-4 font-medium text-slate-800">{c.name}</td><td className="px-6 py-4 font-bold text-blue-600">{c.trips}</td></tr>))}</tbody></table></div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}