import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Save, Trash2, Printer, Car, Calendar, DollarSign, MapPin, 
  User, Clock, FileText, PieChart, Edit, X, ArrowUpDown, Loader, 
  Bell, AlertCircle, CheckCircle, Clock3, Crown, ChevronRight, Search,
  Settings, Download, Upload, BarChart3, LayoutDashboard, TrendingUp,
  LogIn, LogOut, ShieldCheck, CalendarDays, Phone, AlertTriangle
} from 'lucide-react';

// --- IMPORTACIONES FIREBASE ---
import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  query, where, deleteDoc, doc, updateDoc, getDocs, writeBatch 
} from "firebase/firestore";
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithPopup, signOut, linkWithPopup, GoogleAuthProvider
} from "firebase/auth";

// ------------------------------------------------------------------
// TUS CREDENCIALES REALES
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

// --- COMPONENTE GRÁFICO SIMPLE ---
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
  const [currentView, setCurrentView] = useState('daily');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [sortOrder, setSortOrder] = useState('creation');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Refs para navegación rápida
  const movilRef = useRef(null);
  const horaRef = useRef(null);
  const direccionRef = useRef(null);
  const destinoRef = useRef(null);
  const tarifaRef = useRef(null);
  
  // Datos
  const [dailyTrips, setDailyTrips] = useState([]);
  const [weeklyTrips, setWeeklyTrips] = useState([]);
  const [futureTrips, setFutureTrips] = useState([]); 
  
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

  // Formatear Texto
  const formatText = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  useEffect(() => {
    if (!editingId) {
        setFormData(prev => ({ ...prev, fecha: currentDate }));
    }
  }, [currentDate, editingId]);

  // --- AUTENTICACIÓN ---
  useEffect(() => {
    // Escuchar cambios de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAuthError(null);
        setLoading(false);
      } else {
        // Si no hay usuario, intentamos iniciar sesión anónima
        signInAnonymously(auth)
          .catch((error) => {
            console.error("Error al iniciar sesión anónima:", error);
            if (error.code === 'auth/admin-restricted-operation') {
              setAuthError("⚠️ La autenticación anónima no está habilitada en la consola de Firebase.");
            } else {
              setAuthError(`Error de autenticación: ${error.message}`);
            }
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (user && user.isAnonymous) {
          await linkWithPopup(user, provider);
          alert("¡Cuenta vinculada con éxito! Tus datos actuales se han guardado en tu cuenta Google.");
      } else {
          await signInWithPopup(auth, provider);
      }
      setShowUserMenu(false);
    } catch (error) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-blocked') {
          alert("⚠️ Ventana Bloqueada\n\nTu navegador bloqueó la ventana de Google. Busca el icono de 'bloqueo' en la barra de dirección y dale permiso.");
      } else {
          alert(`Error de conexión: ${error.message}`);
      }
    }
  };

  const handleLogout = async () => {
    if (confirm("¿Cerrar sesión? Volverás al modo invitado.")) {
      await signOut(auth);
      setShowUserMenu(false);
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!user) return;
    
    // Diario
    if (currentView === 'daily') {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), where('fecha', '==', currentDate));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a, b) => b.createdAt - a.createdAt);
            setDailyTrips(data);
        }, (error) => {
            console.error("Error leyendo datos diarios:", error);
            if (error.code === 'permission-denied') {
               setAuthError("⚠️ Permiso denegado: Verifica las reglas de seguridad en Firestore.");
            }
        });
        return () => unsub();
    }
    
    // Estadísticas (Semanal)
    if (currentView === 'stats') {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(); d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        // Usamos una query más simple si la compleja falla o filtramos en cliente si son pocos datos
        // Para asegurar compatibilidad, consultamos la colección y filtramos los últimos 7 días si la query 'in' falla.
        // Pero 'in' debería funcionar bien.
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'), where('fecha', 'in', dates));
        const unsub = onSnapshot(q, (snap) => {
            setWeeklyTrips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => console.error("Error stats:", error));
        return () => unsub();
    }
  }, [user, currentDate, currentView]);

  // Futuras
  useEffect(() => {
    if (!user) return;
    // Query simple: traer todo lo del usuario y filtrar en cliente para evitar problemas de índices compuestos
    // Esto es seguro para volúmenes moderados de datos de un solo usuario.
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'));
    
    const unsub = onSnapshot(q, (snap) => {
        const allTrips = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const futureData = allTrips.filter(t => t.fecha > currentDate && t.estado === 'Agendado');
        
        futureData.sort((a, b) => {
            if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
            return a.hora.localeCompare(b.hora);
        });
        setFutureTrips(futureData);
    }, (error) => console.error("Error future trips:", error));
    
    return () => unsub();
  }, [user, currentDate]);

  // --- ESTADÍSTICAS ---
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
        tripsByDay[dateStr] = { label, count: 0, income: 0 };
        daysLabels.push(dateStr);
    }
    weeklyTrips.forEach(t => {
        if (t.estado === 'Completado' && tripsByDay[t.fecha]) {
            tripsByDay[t.fecha].count += 1;
            tripsByDay[t.fecha].income += t.tarifa;
        }
    });
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

  // --- PROCESAMIENTO DIARIO ---
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
      return { movil, ...data, commission: isOwner ? data.total : data.total * 0.20, isOwner };
    }).sort((a, b) => parseInt(a.movil) - parseInt(b.movil));
  }, [dailyTrips]);

  const dailyTotal = driverDailySummary.reduce((acc, curr) => acc + curr.total, 0);
  const centralTotal = driverDailySummary.reduce((acc, curr) => acc + curr.commission, 0);

  // --- ACCIONES ---
  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.name === 'movil') {
          setFormData(prev => ({
              ...prev,
              hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          }));
      }
      if (nextFieldRef === 'submit') {
          handleSubmit(e);
      } else if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    
    if ((formData.estado === 'Completado' || formData.estado === 'Pendiente') && (!formData.movil || !formData.tarifa)) { 
        alert("Para viajes Completados o Pendientes, asigna Móvil y Tarifa."); 
        return; 
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
      
      setFormData({ 
          fecha: currentDate, 
          movil: '', 
          hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), 
          direccion: '', 
          destino: '', 
          pasajero: '', 
          telefono: '',
          tarifa: '', 
          estado: 'Completado' 
      });
      
      if (movilRef.current) movilRef.current.focus();

    } catch (error) { console.error(error); }
  };

  const handleEdit = (trip) => {
    setEditingId(trip.id);
    setFormData({ 
        fecha: trip.fecha,
        movil: trip.movil === '---' ? '' : trip.movil, 
        hora: trip.hora, 
        direccion: trip.direccion, 
        destino: trip.destino || '', 
        pasajero: trip.pasajero || '',
        telefono: trip.telefono || '', 
        tarifa: trip.tarifa === 0 ? '' : trip.tarifa, 
        estado: trip.estado 
    });
    if (currentView === 'stats') setCurrentView('daily');
  };

  const deleteTrip = async (id) => { if (confirm('¿Borrar permanentemente?')) { await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id)); if (editingId === id) setEditingId(null); } };

  const cancelEdit = () => {
      setEditingId(null);
      setFormData({
        fecha: currentDate,
        movil: '',
        hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        direccion: '',
        destino: '',
        pasajero: '',
        telefono: '',
        tarifa: '',
        estado: 'Completado'
      });
  }

  // --- BACKUP / RESTORE ---
  const handleExportBackup = async () => {
    if (!user) return;
    try {
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'trips'));
        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (allData.length === 0) { alert("No hay datos."); return; }
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Respaldo_RT_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowSettings(false);
    } catch (error) { alert("Error al generar respaldo."); }
  };

  const handleImportBackup = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        setIsRestoring(true);
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data) || !confirm(`¿Restaurar ${data.length} registros?`)) { setIsRestoring(false); return; }

            const CHUNK_SIZE = 400;
            for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                const chunk = data.slice(i, i + CHUNK_SIZE);
                const batch = writeBatch(db);
                chunk.forEach(item => { 
                    const { id, ...docData } = item; 
                    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trips', id || String(Date.now() + Math.random()));
                    batch.set(docRef, docData); 
                });
                await batch.commit();
            }
            alert(`✅ Restauración completada.`);
            setShowSettings(false);
            const newDate = new Date().toISOString().split('T')[0];
            setCurrentDate(newDate); 
        } catch (err) { alert("❌ Archivo inválido."); } finally { setIsRestoring(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };
    reader.readAsText(file);
  };

  // Carga Dinámica de PDF
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
      doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("LIBRO DE CONTROL DIARIO", 14, 20);
      doc.setFontSize(10); doc.text(`Fecha: ${currentDate}`, 195, 20, { align: 'right' });
      
      doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.text("Resumen Financiero", 14, 50);
      doc.autoTable({ startY: 55, head: [['Concepto', 'Monto Total']], body: [['Total Recaudado', `$ ${dailyTotal.toLocaleString('es-CL')}`], ['Ganancia Central', `$ ${centralTotal.toLocaleString('es-CL')}`]], theme: 'striped', headStyles: { fillColor: [59, 130, 246] } });
      
      doc.text("Detalle por Conductor", 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({ startY: doc.lastAutoTable.finalY + 20, head: [['Conductor', 'Viajes', 'Total Bruto', 'A Pagar a Base']], body: driverDailySummary.map(d => [`Móvil ${d.movil} ${d.isOwner?'(Dueño)':''}`, d.count, `$ ${d.total.toLocaleString('es-CL')}`, `$ ${d.commission.toLocaleString('es-CL')}`]), theme: 'grid', headStyles: { fillColor: [30, 41, 59] } });
      
      doc.text("Bitácora", 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({ startY: doc.lastAutoTable.finalY + 20, head: [['Hora', 'Móvil', 'Origen', 'Destino', 'Tarifa', 'Estado']], body: processedDailyTrips.map(t => [t.hora, t.movil, t.direccion, t.destino||'-', t.tarifa>0?`$ ${t.tarifa.toLocaleString('es-CL')}`:'-', t.estado]), theme: 'striped' });
      doc.save(`RT_${currentDate}.pdf`);
    } catch (e) { alert("Error PDF"); } finally { setIsGeneratingPdf(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400 font-light">Cargando sistema...</div>;

  return (
    <div className="h-screen bg-[#F5F5F7] text-slate-800 font-sans flex flex-col overflow-hidden selection:bg-blue-100 relative">
      <style>{`.custom-scrollbar::-webkit-scrollbar {width:6px;height:6px} .custom-scrollbar::-webkit-scrollbar-track {background:transparent} .custom-scrollbar::-webkit-scrollbar-thumb {background-color:rgba(0,0,0,0);border-radius:10px;transition:background-color 0.3s ease} .custom-scrollbar:hover::-webkit-scrollbar-thumb {background-color:rgba(0,0,0,0.2)}`}</style>

      {isRestoring && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-lg font-semibold text-slate-700">Restaurando tu historial...</p>
              <p className="text-sm text-slate-500">Por favor no cierres la página.</p>
          </div>
      )}

      <header className="flex-none bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl shadow-lg"><Car className="text-white w-5 h-5" /></div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Control Radiotaxi</h1>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${user?.isAnonymous ? 'bg-orange-400' : 'bg-green-500'}`}></span> 
                  {user?.isAnonymous ? 'Modo Invitado' : 'Sincronizado'}
              </div>
            </div>
          </div>

          <div className="flex bg-gray-100/80 p-1 rounded-xl">
            <button onClick={() => setCurrentView('daily')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutDashboard className="w-4 h-4" /> Control Diario
            </button>
            <button onClick={() => setCurrentView('stats')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentView === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <BarChart3 className="w-4 h-4" /> Estadísticas
            </button>
          </div>
          
          <div className="flex gap-3 items-center">
            {currentView === 'daily' && (
                <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-lg border border-gray-200/50">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 font-medium text-sm cursor-pointer" />
                </div>
            )}
            
            <button onClick={generatePDF} disabled={isGeneratingPdf} className="p-2 rounded-lg text-slate-400 hover:bg-gray-100 hover:text-slate-900 transition-all">
                {isGeneratingPdf ? <Loader className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-gray-100'}`}>
                <Settings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-blue-50 p-2 rounded-lg mb-2 text-xs text-blue-700 border border-blue-100">
                      💡 <b>Tip:</b> Usa "Respaldo Local" regularmente para guardar una copia segura en tu PC.
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 pl-2 pt-1">Gestión de Datos</p>
                  <button onClick={handleExportBackup} className="w-full flex items-center gap-3 p-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition-colors mb-1">
                    <Download className="w-4 h-4" /> <div><p className="font-medium">Descargar Respaldo</p><p className="text-[10px] text-slate-400">Guardar archivo .json</p></div>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition-colors">
                    <Upload className="w-4 h-4" /> <div><p className="font-medium">Restaurar Datos</p><p className="text-[10px] text-slate-400">Subir archivo .json</p></div>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
                </div>
              )}
            </div>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full border border-white" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-white font-bold text-xs">{user?.isAnonymous ? 'G' : user?.email?.[0].toUpperCase()}</div>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-gray-50">
                        <p className="text-sm font-bold text-slate-900">{user?.isAnonymous ? 'Usuario Invitado' : user?.displayName || 'Usuario'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.isAnonymous ? 'Datos temporales' : user?.email}</p>
                    </div>
                    <div className="p-1 mt-1">
                        {user?.isAnonymous ? (
                            <button onClick={handleGoogleLogin} className="w-full flex items-center gap-3 p-2.5 text-left text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm">
                                <ShieldCheck className="w-4 h-4" /> 
                                <div><p className="font-medium">Sincronizar con Google</p><p className="text-[10px] opacity-80">Guardar datos en la nube</p></div>
                            </button>
                        ) : (
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                <LogOut className="w-4 h-4" /> Cerrar Sesión
                            </button>
                        )}
                    </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
      
      {/* ALERT DE ERROR DE AUTH */}
      {authError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-red-700 text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{authError}</span>
              <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold ml-1">Ir a la Consola</a>
          </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1400px] mx-auto h-full">
            {currentView === 'daily' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0">
                    <div className="lg:col-span-4 xl:col-span-4 h-full overflow-y-auto bg-white border-r border-gray-200 custom-scrollbar p-6 space-y-8">
                        <div className={`relative transition-all ${editingId ? 'bg-blue-50/50 ring-1 ring-blue-100 rounded-3xl p-1 -m-1' : ''}`}>
                            <div className="flex justify-between mb-5 px-1">
                                <h2 className="text-xl font-semibold text-slate-900 flex gap-2">{editingId ? 'Editar' : 'Nuevo Ingreso'}</h2>
                                {editingId && <button onClick={cancelEdit}><X className="w-4 h-4 text-slate-500" /></button>}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="bg-gray-50 p-1 rounded-xl flex text-xs font-medium text-slate-500">
                                    {['Completado', 'Agendado', 'Pendiente', 'Cancelado'].map((status) => (
                                    <button type="button" key={status} onClick={() => setFormData({ ...formData, estado: status })}
                                        className={`flex-1 py-2 rounded-lg transition-all 
                                            ${formData.estado === status ? 'bg-white text-slate-900 shadow-sm' : ''} 
                                            ${status === 'Cancelado' && formData.estado === status ? 'text-red-600' : ''}
                                            ${status === 'Pendiente' && formData.estado === status ? 'text-amber-600' : ''}
                                        `}>
                                        {status}
                                    </button>
                                    ))}
                                </div>
                                <div className="group">
                                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Fecha del Viaje</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><CalendarDays className="h-4 w-4 text-slate-400" /></div>
                                        <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Car className="h-4 w-4 text-slate-400" /></div>
                                        <input ref={movilRef} onKeyDown={(e) => handleKeyDown(e, horaRef)} type="number" name="movil" value={formData.movil} onChange={handleInputChange} placeholder="Móvil" className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    </div>
                                    <input ref={horaRef} onKeyDown={(e) => handleKeyDown(e, direccionRef)} type="time" name="hora" value={formData.hora} onChange={handleInputChange} className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><MapPin className="h-4 w-4 text-slate-400" /></div>
                                    <input ref={direccionRef} onKeyDown={(e) => handleKeyDown(e, destinoRef)} type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección retiro" required className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input ref={destinoRef} onKeyDown={(e) => handleKeyDown(e, tarifaRef)} type="text" name="destino" value={formData.destino} onChange={handleInputChange} placeholder="Destino (Opc)" className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><DollarSign className="h-4 w-4 text-green-600" /></div>
                                        <input ref={tarifaRef} onKeyDown={(e) => handleKeyDown(e, 'submit')} type="number" name="tarifa" value={formData.tarifa} onChange={handleInputChange} placeholder="Tarifa" className="block w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none placeholder-green-700/30" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" name="pasajero" value={formData.pasajero} onChange={handleInputChange} placeholder="Pasajero" className="block w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Phone className="h-4 w-4 text-slate-400" /></div>
                                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono (Opc)" className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                                    </div>
                                </div>

                                <button type="submit" className={`w-full py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 ${editingId ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-black'}`}>
                                    {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? 'Guardar' : 'Registrar'}
                                </button>
                            </form>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> Agenda Hoy <span className="bg-gray-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{agendaItemsToday.length}</span>
                            </h3>
                            <div className="space-y-3">
                                {agendaItemsToday.length === 0 ? <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-xl">Nada pendiente hoy</p> : agendaItemsToday.map(item => (
                                    <div key={item.id} onClick={() => handleEdit(item)} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 cursor-pointer relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.estado === 'Pendiente' ? 'bg-yellow-400' : 'bg-orange-400'}`}></div>
                                        <div className="flex justify-between mb-1 pl-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold text-slate-800 bg-gray-50 px-1.5 rounded text-sm">{item.hora}</span>
                                                {item.estado === 'Pendiente' && <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Por Cobrar</span>}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 pl-2 truncate">{item.direccion}</p>
                                        <div className="pl-2 text-xs text-slate-400 mt-1">{item.pasajero} • {item.movil !== '---' ? `Móvil ${item.movil}` : 'S/A'} {item.estado === 'Pendiente' ? `• $${item.tarifa}` : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {futureTrips.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2 mt-8">
                                    <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span> Próximos Días <span className="bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full">{futureTrips.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {futureTrips.map(item => (
                                        <div key={item.id} onClick={() => handleEdit(item)} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 cursor-pointer relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                                            <div className="flex justify-between mb-1 pl-2 items-center">
                                                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wide">
                                                    {new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="font-mono font-semibold text-slate-500 text-xs">{item.hora}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 pl-2 mt-2">{item.direccion}</p>
                                            <div className="pl-2 text-xs text-slate-400 mt-1">{item.pasajero}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="lg:col-span-8 xl:col-span-8 h-full overflow-y-auto bg-[#F5F5F7] p-6 lg:p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Total Recaudado (Hoy)</p>
                                <h3 className="text-3xl font-bold text-slate-900">${dailyTotal.toLocaleString('es-CL')}</h3>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs font-medium text-slate-400 uppercase mb-1">Ganancia Central</p>
                                <h3 className="text-3xl font-bold text-blue-600">${centralTotal.toLocaleString('es-CL')}</h3>
                            </div>
                        </div>
                        <div className="mb-8 overflow-x-auto custom-scrollbar pb-2">
                            <div className="flex gap-3 min-w-max">
                                {driverDailySummary.map(d => (
                                    <div key={d.movil} className={`flex flex-col p-4 rounded-2xl border min-w-[160px] ${d.isOwner ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-gray-100'}`}>
                                        <div className="flex justify-between mb-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${d.isOwner ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-slate-600'}`}>Móvil {d.movil}</span>
                                            {d.isOwner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                        </div>
                                        <div className="mt-auto">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="text-xs text-slate-400">Recaudado</p>
                                                <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-gray-100">{d.count} viajes</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">${d.total.toLocaleString('es-CL')}</p>
                                            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                                                <span className="text-slate-400">Base</span>
                                                <span className={`font-bold ${d.isOwner ? 'text-amber-600' : 'text-blue-600'}`}>${d.commission.toLocaleString('es-CL')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="font-bold text-slate-900 text-sm">Movimientos del Día</h3>
                                <button onClick={() => setSortOrder(prev => prev === 'time' ? 'creation' : 'time')} className="text-xs font-medium text-slate-500 bg-gray-50 px-3 py-1.5 rounded-lg flex gap-1 items-center hover:bg-gray-100">
                                    <ArrowUpDown className="w-3 h-3" /> {sortOrder === 'time' ? 'Por Hora' : 'Por Ingreso'}
                                </button>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50 border-b border-gray-100">
                                    <tr><th className="px-6 py-4">Hora</th><th className="px-6 py-4">Móvil</th><th className="px-6 py-4">Detalle</th><th className="px-6 py-4">Tarifa</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4"></th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {processedDailyTrips.length === 0 ? <tr><td colSpan="6" className="text-center py-12 text-slate-400">Sin registros hoy</td></tr> : processedDailyTrips.map(t => (
                                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-500 text-xs">{t.hora}</td>
                                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${t.movil.toString() === '6' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{t.movil}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{t.direccion}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{t.destino && <span>➜ {t.destino}</span>} {t.pasajero && <span>• {t.pasajero}</span>}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{t.tarifa > 0 ? `$${t.tarifa.toLocaleString('es-CL')}` : '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border 
                                                    ${t.estado === 'Completado' ? 'bg-green-50 text-green-700 border-green-100' : 
                                                      t.estado === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-100' : 
                                                      t.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                      'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                    {t.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                                                    <button onClick={() => handleEdit(t)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteTrip(t.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* --- VISTA 2: ESTADÍSTICAS --- */}
            {currentView === 'stats' && (
                <div className="h-full overflow-y-auto bg-[#F5F5F7] p-6 lg:p-10 custom-scrollbar pb-32">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reporte Semanal</h2>
                        <p className="text-slate-500">Resumen de actividad de los últimos 7 días</p>
                    </div>
                    {!stats ? <div className="flex justify-center py-20 text-slate-400"><Loader className="w-8 h-8 animate-spin" /></div> : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-50 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div><span className="text-sm font-medium text-slate-500">Ingresos (7 días)</span></div>
                                    <p className="text-3xl font-bold text-slate-900">${stats.totalIncome.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-50 rounded-xl"><Car className="w-5 h-5 text-blue-600" /></div><span className="text-sm font-medium text-slate-500">Total Viajes</span></div>
                                    <p className="text-3xl font-bold text-slate-900">{stats.totalTrips}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-50 rounded-xl"><Crown className="w-5 h-5 text-amber-600" /></div><span className="text-sm font-medium text-slate-500">Mejor Móvil</span></div>
                                    <p className="text-3xl font-bold text-slate-900">{stats.topDrivers[0] ? `Móvil ${stats.topDrivers[0].id}` : '-'}</p>
                                    {stats.topDrivers[0] && <p className="text-xs text-slate-400 mt-1">${stats.topDrivers[0].income.toLocaleString('es-CL')} generados</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Tendencia Semanal</h3>
                                    <div className="flex-1"><SimpleBarChart data={stats.chartDataDaily} labelKey="day" valueKey="trips" colorClass="bg-slate-800" /></div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-80 flex flex-col">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Horas Punta</h3>
                                    <div className="flex-1"><SimpleBarChart data={stats.chartDataHours} labelKey="hour" valueKey="count" colorClass="bg-blue-500" /></div>
                                </div>
                            </div>
                            
                            {/* TOP CLIENTES Y CONDUCTORES */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-slate-900">Top Conductores</h3></div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Móvil</th><th className="px-6 py-3">Viajes</th><th className="px-6 py-3">Recaudado</th></tr></thead>
                                        <tbody>
                                            {stats.topDrivers.map((d, idx) => (
                                                <tr key={d.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50">
                                                    <td className="px-6 py-4"><span className="font-bold text-slate-300">#{idx + 1}</span></td>
                                                    <td className="px-6 py-4 font-bold text-slate-700">Móvil {d.id}</td>
                                                    <td className="px-6 py-4 text-slate-600">{d.trips}</td>
                                                    <td className="px-6 py-4 font-bold text-green-600">${d.income.toLocaleString('es-CL')}</td>
                                                </tr>
                                            ))}
                                            {stats.topDrivers.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-400">Sin datos</td></tr>}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-slate-900">Clientes Frecuentes (Por Teléfono)</h3></div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 font-semibold uppercase bg-gray-50/50"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Teléfono</th><th className="px-6 py-3">Nombre</th><th className="px-6 py-3">Viajes</th></tr></thead>
                                        <tbody>
                                            {stats.topCustomers.map((c, idx) => (
                                                <tr key={c.phone} className="border-b border-gray-50 last:border-none hover:bg-gray-50">
                                                    <td className="px-6 py-4"><span className="font-bold text-slate-300">#{idx + 1}</span></td>
                                                    <td className="px-6 py-4 font-mono text-slate-600">{c.phone}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                                                    <td className="px-6 py-4 font-bold text-blue-600">{c.trips}</td>
                                                </tr>
                                            ))}
                                            {stats.topCustomers.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-slate-400">Sin datos telefónicos</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
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