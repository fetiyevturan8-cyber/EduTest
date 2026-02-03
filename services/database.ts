
import { DatabaseSchema, User, Classroom, Test, TestAttempt, UserRole } from '../types';

const DB_KEY = 'edutest_global_v3_core';
const SESSION_KEY = 'edutest_active_session_v3';

const initialDB: DatabaseSchema = {
  users: [],
  tests: [],
  classrooms: [],
  attempts: [],
  version: '3.1.0'
};

class GlobalDatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
      }
    } catch (e) {
      console.error("Cloud DB Initialization Error:", e);
    }
  }

  // Simüle edilmiş ağ gecikmesi ve %5 hata olasılığı (Global Node Reliability)
  private async simulateNetwork() {
    const latency = 400 + Math.random() * 800;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) { // %5 hata simülasyonu
          // console.warn("Network Jitter Detected - Retrying...");
        }
        resolve(true);
      }, latency);
    });
  }

  private getDB(): DatabaseSchema {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialDB;
  }

  private saveDB(db: DatabaseSchema) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  // --- IDENTITY & ACCESS ---

  async register(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
    await this.simulateNetwork();
    const db = this.getDB();
    if (db.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, message: 'Bu e-posta adresi zaten global sistemde kayıtlı.' };
    }

    const newUser: User = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    db.users.push(newUser);
    this.saveDB(db);
    return { success: true, message: 'Global Cloud profiliniz oluşturuldu.' };
  }

  async authenticate(email: string, pass: string): Promise<User | null> {
    await this.simulateNetwork();
    const db = this.getDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      const { password, ...sessionUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser as User;
    }
    return null;
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  // --- ACADEMIC ---

  async createClassroom(name: string, teacherId: string): Promise<Classroom> {
    await this.simulateNetwork();
    const db = this.getDB();
    const newClass: Classroom = {
      id: 'cls_' + Math.random().toString(36).substr(2, 6),
      name,
      teacherId,
      code: Math.random().toString(36).substr(2, 5).toUpperCase(),
      studentIds: []
    };
    db.classrooms.push(newClass);
    this.saveDB(db);
    return newClass;
  }

  async joinClassroom(code: string, studentId: string): Promise<Classroom | null> {
    await this.simulateNetwork();
    const db = this.getDB();
    const classroom = db.classrooms.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (classroom) {
      if (!classroom.studentIds.includes(studentId)) {
        classroom.studentIds.push(studentId);
        this.saveDB(db);
      }
      return classroom;
    }
    return null;
  }

  async getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
    await this.simulateNetwork();
    return this.getDB().classrooms.filter(c => c.teacherId === teacherId);
  }

  async getStudentClassrooms(studentId: string): Promise<Classroom[]> {
    await this.simulateNetwork();
    return this.getDB().classrooms.filter(c => c.studentIds.includes(studentId));
  }

  async getClassStudentsDetailed(studentIds: string[]): Promise<User[]> {
    await this.simulateNetwork();
    const db = this.getDB();
    return db.users
      .filter(u => studentIds.includes(u.id))
      .map(({ password, ...rest }) => rest as User);
  }

  // --- TESTS ---

  async syncTest(test: Omit<Test, 'id' | 'createdAt'>, id?: string): Promise<Test> {
    await this.simulateNetwork();
    const db = this.getDB();
    if (id) {
      const idx = db.tests.findIndex(t => t.id === id);
      if (idx !== -1) {
        db.tests[idx] = { ...db.tests[idx], ...test };
        this.saveDB(db);
        return db.tests[idx];
      }
    }
    const newTest: Test = {
      ...test,
      id: 'tst_' + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now()
    };
    db.tests.push(newTest);
    this.saveDB(db);
    return newTest;
  }

  async toggleTest(testId: string) {
    await this.simulateNetwork();
    const db = this.getDB();
    const test = db.tests.find(t => t.id === testId);
    if (test) {
      test.isActive = !test.isActive;
      this.saveDB(db);
    }
  }

  async getAvailableTests(studentId: string): Promise<Test[]> {
    await this.simulateNetwork();
    const db = this.getDB();
    const studentClasses = db.classrooms.filter(c => c.studentIds.includes(studentId)).map(c => c.id);
    // Kural: Öğrencinin dahil olduğu sınıfların testleri + Tüm dünyaya açık (public) testler
    return db.tests.filter(t => t.isPublic || t.allowedClassIds.some(cid => studentClasses.includes(cid)));
  }

  async getTeacherTests(teacherId: string): Promise<Test[]> {
    await this.simulateNetwork();
    return this.getDB().tests.filter(t => t.teacherId === teacherId);
  }

  async recordAttempt(attempt: Omit<TestAttempt, 'id' | 'timestamp'>): Promise<TestAttempt> {
    await this.simulateNetwork();
    const db = this.getDB();
    const newAttempt: TestAttempt = {
      ...attempt,
      id: 'att_' + Math.random().toString(36).substr(2, 6),
      timestamp: Date.now()
    };
    db.attempts.push(newAttempt);
    this.saveDB(db);
    return newAttempt;
  }

  async getStudentAttempts(studentId: string): Promise<TestAttempt[]> {
    await this.simulateNetwork();
    return this.getDB().attempts.filter(a => a.studentId === studentId);
  }

  async getTestAttempts(testId: string): Promise<TestAttempt[]> {
    await this.simulateNetwork();
    return this.getDB().attempts.filter(a => a.testId === testId);
  }

  // --- ADMIN ---

  async getGlobalSystemState(): Promise<DatabaseSchema> {
    await this.simulateNetwork();
    return this.getDB();
  }

  async wipeSystem() {
    await this.simulateNetwork();
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }

  async removeEntity(type: 'users' | 'tests' | 'classrooms' | 'attempts', id: string) {
    await this.simulateNetwork();
    const db = this.getDB();
    (db[type] as any) = (db[type] as any[]).filter((item: any) => item.id !== id);
    this.saveDB(db);
  }
}

export const db = new GlobalDatabaseService();
